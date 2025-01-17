// Copyright 2023 xObserve.io Team

import {
  Box,
  Button,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import ColorTag from 'src/components/ColorTag'
import { EditorInputItem } from 'src/components/editor/EditorItem'
import { FormSection } from 'src/components/form/Form'
import FormItem from 'src/components/form/Item'
import { cloneDeep } from 'lodash'
import React, { useEffect, useState } from 'react'
import { commonMsg, dashboardSettingMsg } from 'src/i18n/locales/en'
import { Annotation } from 'types/annotation'
import { requestApi } from 'utils/axios/request'
import { isEmpty } from 'utils/validate'
import { $rawDashAnnotations } from '../dashboard/store/annotation'
import { dateTimeFormat } from 'utils/datetime/formatter'
import { durationToSeconds } from 'utils/date'

interface Props {
  annotation: Annotation
  onEditorClose: any
}
const AnnotationEditor = (props: Props) => {
  const { onEditorClose } = props
  const [annotation, setAnnotation] = useState<Annotation>(
    cloneDeep(props.annotation),
  )
  const t = useStore(commonMsg)
  const t1 = useStore(dashboardSettingMsg)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tag, setTag] = useState('')
  const toast = useToast()

  useEffect(() => {
    annotation ? onOpen() : onClose()
  }, [annotation])

  const onModalClose = () => {
    onEditorClose()
    onClose()
  }

  const addTag = () => {
    if (annotation.tags?.length >= 3) {
      toast({
        title: t1.tagsExceedLimit,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (annotation.tags?.includes(tag)) {
      setTag('')
      return
    }

    setTag('')
    annotation.tags.push(tag)
  }

  const onSubmit = async () => {
    const id = annotation.id
    if (isEmpty(annotation.text)) {
      toast({
        title: t.isInvalid({ name: t.description }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const res = await requestApi.post(`/annotation`, annotation)
    annotation.id = res.data
    let msg
    if (id == 0) {
      $rawDashAnnotations.set([...$rawDashAnnotations.get(), annotation])
      msg = t.isAdded({ name: t.annotation })
    } else {
      const index = $rawDashAnnotations.get().findIndex((a) => a.id == id)
      const annos = $rawDashAnnotations.get()
      annos[index] = annotation
      $rawDashAnnotations.set([...annos])
      msg = t.isUpdated({ name: t.annotation })
    }

    toast({
      title: msg,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    onModalClose()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t.editItem({ name: t.annotation })}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormSection>
              <FormItem title={t.description} labelWidth='90px'>
                <EditorInputItem
                  type='textarea'
                  placeholder={t.inputTips({ name: t.description })}
                  value={annotation.text}
                  onChange={(v) => {
                    setAnnotation({ ...annotation, text: v })
                  }}
                />
              </FormItem>
              <FormItem title={t.tags} labelWidth='90px'>
                <Input
                  value={tag}
                  onChange={(e) => setTag(e.currentTarget.value)}
                  placeholder={t1.tagInputTips}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addTag()
                    }
                  }}
                />
              </FormItem>
              {annotation.tags.length > 0 && (
                <HStack width='100%'>
                  {annotation.tags.map((t) => (
                    <ColorTag
                      name={t}
                      onRemove={(_) => {
                        annotation.tags.splice(annotation.tags.indexOf(t), 1)
                        setAnnotation({ ...annotation })
                      }}
                    />
                  ))}
                </HStack>
              )}
              <FormItem title={t.duration} labelWidth='90px'>
                <Box>
                  <EditorInputItem
                    value={annotation.duration}
                    onChange={(v) => {
                      setAnnotation({ ...annotation, duration: v })
                    }}
                    placeholder='e.g 1s 2m 1h 3h20m30s'
                  />
                </Box>
              </FormItem>
              <FormItem
                title={t.startTime}
                alignItems='center'
                labelWidth='90px'
              >
                <Text textStyle='annotation'>
                  {dateTimeFormat(annotation.time * 1000)}
                </Text>
              </FormItem>
              <FormItem title={t.endTime} alignItems='center' labelWidth='90px'>
                <Text textStyle='annotation'>
                  {dateTimeFormat(
                    (annotation.time + durationToSeconds(annotation.duration)) *
                      1000,
                  )}
                </Text>
              </FormItem>
            </FormSection>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onModalClose}>
              {t.cancel}
            </Button>
            <Button variant='ghost' onClick={onSubmit}>
              {t.submit}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AnnotationEditor
