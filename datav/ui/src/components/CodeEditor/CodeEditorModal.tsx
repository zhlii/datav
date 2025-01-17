// Copyright 2023 xObserve.io Team

import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import CodeEditor from 'src/components/CodeEditor/CodeEditor'
import React, { useEffect, useState } from 'react'
import { MobileBreakpoint } from 'src/data/constants'
import { commonMsg } from 'src/i18n/locales/en'

interface Props {
  value: string
  onChange: any
  triggerProps?: Record<string, string>
}
export const CodeEditorModal = ({
  value,
  onChange,
  triggerProps = {},
}: Props) => {
  const t = useStore(commonMsg)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [temp, setTemp] = useState(null)

  useEffect(() => {
    setTemp(value)
  }, [value])

  const onSubmit = () => {
    onChange(temp)
    onClose()
  }

  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
  return (
    <>
      <Button size='sm' onClick={onOpen} {...triggerProps}>
        {isLargeScreen ? t.editFunc : t.edit}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size='full'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader py='2'>
            {t.editFunc}
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody pt='2' pb='0' px='0'>
            <Box height='400px'>
              <CodeEditor value={temp} onChange={(v) => setTemp(v)} />
            </Box>
            <Button onClick={onSubmit} width='100%'>
              {t.submit}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
