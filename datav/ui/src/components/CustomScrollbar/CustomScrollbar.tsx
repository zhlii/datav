// Copyright 2023 xObserve.io Team

import { css, cx } from '@emotion/css'
import React, { RefCallback, useCallback, useEffect, useRef } from 'react'
import Scrollbars, { positionValues } from 'react-custom-scrollbars-2'

import { ScrollIndicators } from './ScrollIndicators'
import { useExtraStyles } from 'hooks/useExtraTheme'
import { useColorMode } from '@chakra-ui/react'
import customColors from 'theme/colors'

export type ScrollbarPosition = positionValues

interface Props {
  className?: string
  testId?: string
  autoHide?: boolean
  autoHideTimeout?: number
  autoHeightMax?: string
  hideTracksWhenNotNeeded?: boolean
  hideHorizontalTrack?: boolean
  hideVerticalTrack?: boolean
  scrollRefCallback?: RefCallback<HTMLDivElement>
  scrollTop?: number
  setScrollTop?: (position: ScrollbarPosition) => void
  showScrollIndicators?: boolean
  autoHeightMin?: number | string
  updateAfterMountMs?: number
  onScroll?: React.UIEventHandler
}

/**
 * Wraps component into <Scrollbars> component from `react-custom-scrollbars`
 */
const CustomScrollbar = ({
  autoHide = false,
  autoHideTimeout = 200,
  setScrollTop,
  className,
  testId,
  autoHeightMin = '0',
  autoHeightMax = '100%',
  hideTracksWhenNotNeeded = false,
  hideHorizontalTrack,
  hideVerticalTrack,
  scrollRefCallback,
  showScrollIndicators = false,
  updateAfterMountMs,
  scrollTop,
  onScroll,
  children,
}: React.PropsWithChildren<Props>) => {
  const ref = useRef<Scrollbars & { view: HTMLDivElement; update: () => void }>(
    null,
  )
  const styles = useExtraStyles(getStyles)

  useEffect(() => {
    if (ref.current && scrollRefCallback) {
      scrollRefCallback(ref.current.view)
    }
  }, [ref, scrollRefCallback])

  useEffect(() => {
    if (ref.current && scrollTop != null) {
      ref.current.scrollTop(scrollTop)
    }
  }, [scrollTop])

  /**
   * Special logic for doing a update a few milliseconds after mount to check for
   * updated height due to dynamic content
   */
  useEffect(() => {
    if (!updateAfterMountMs) {
      return
    }
    setTimeout(() => {
      const scrollbar = ref.current
      if (scrollbar?.update) {
        scrollbar.update()
      }
    }, updateAfterMountMs)
  }, [updateAfterMountMs])

  function renderTrack(
    className: string,
    hideTrack: boolean | undefined,
    passedProps: JSX.IntrinsicElements['div'],
  ) {
    if (passedProps.style && hideTrack) {
      passedProps.style.display = 'none'
    }

    return <div {...passedProps} className={className} />
  }

  const renderTrackHorizontal = useCallback(
    (passedProps: JSX.IntrinsicElements['div']) => {
      return renderTrack('track-horizontal', hideHorizontalTrack, passedProps)
    },
    [hideHorizontalTrack],
  )

  const renderTrackVertical = useCallback(
    (passedProps: JSX.IntrinsicElements['div']) => {
      return renderTrack('track-vertical', hideVerticalTrack, passedProps)
    },
    [hideVerticalTrack],
  )

  const renderThumbHorizontal = useCallback(
    (passedProps: JSX.IntrinsicElements['div']) => {
      return <div {...passedProps} className='thumb-horizontal' />
    },
    [],
  )

  const renderThumbVertical = useCallback(
    (passedProps: JSX.IntrinsicElements['div']) => {
      return <div {...passedProps} className='thumb-vertical' />
    },
    [],
  )

  const renderView = useCallback(
    (passedProps: JSX.IntrinsicElements['div']) => {
      // fixes issues of visibility on safari and ios devices
      if (
        passedProps.style &&
        passedProps.style['WebkitOverflowScrolling'] === 'touch'
      ) {
        passedProps.style['WebkitOverflowScrolling'] = 'auto'
      }

      return <div {...passedProps} className='scrollbar-view' />
    },
    [],
  )

  const onScrollStop = useCallback(() => {
    ref.current && setScrollTop && setScrollTop(ref.current.getValues())
  }, [setScrollTop])

  return (
    <Scrollbars
      data-testid={testId}
      ref={ref}
      className={cx(styles.customScrollbar, className, {
        [styles.scrollbarWithScrollIndicators]: showScrollIndicators,
      })}
      onScrollStop={onScrollStop}
      autoHeight={true}
      autoHide={autoHide}
      autoHideTimeout={autoHideTimeout}
      hideTracksWhenNotNeeded={hideTracksWhenNotNeeded}
      // These autoHeightMin & autoHeightMax options affect firefox and chrome differently.
      // Before these where set to inherit but that caused problems with cut of legends in firefox
      autoHeightMax={autoHeightMax}
      autoHeightMin={autoHeightMin}
      renderTrackHorizontal={renderTrackHorizontal}
      renderTrackVertical={renderTrackVertical}
      renderThumbHorizontal={renderThumbHorizontal}
      renderThumbVertical={renderThumbVertical}
      renderView={renderView}
      onScroll={onScroll}
    >
      {showScrollIndicators ? (
        <ScrollIndicators>{children}</ScrollIndicators>
      ) : (
        children
      )}
    </Scrollbars>
  )
}

export default CustomScrollbar

const getStyles = (theme) => {
  const { colorMode } = useColorMode()
  const bg =
    colorMode == 'light'
      ? customColors.scrollBg.light
      : customColors.scrollBg.dark
  return {
    customScrollbar: css`
      // Fix for Firefox. For some reason sometimes .view container gets a height of its content, but in order to
      // make scroll working it should fit outer container size (scroll appears only when inner container size is
      // greater than outer one).
      display: flex;
      flex-grow: 1;
      .scrollbar-view {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
      }
      .track-vertical {
        border-radius: 4px;
        width: 4px !important;
        right: 0px;
        bottom: 2px;
        top: 2px;
      }
      .track-horizontal {
        border-radius: 4px;
        height: 4px !important;
        right: 2px;
        bottom: 2px;
        left: 2px;
      }
      .thumb-vertical {
        background: ${bg};
        border-radius: 4px;
        opacity: 0;
      }
      .thumb-horizontal {
        background: ${bg};
        border-radius: 4px;
        opacity: 0;
      }
      &:hover {
        .thumb-vertical,
        .thumb-horizontal {
          opacity: 1;
          transition: opacity 0.3s ease-in-out;
        }
      }
    `,
    // override the scroll container position so that the scroll indicators
    // are positioned at the top and bottom correctly.
    // react-custom-scrollbars doesn't provide any way for us to hook in nicely,
    // so we have to override with !important. feelsbad.
    scrollbarWithScrollIndicators: css`
      .scrollbar-view {
        position: static !important;
      }
    `,
  }
}
