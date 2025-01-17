// Copyright 2023 xObserve.io Team

import { useStore } from '@nanostores/react'
import Page from 'layouts/page/Page'
import React, { memo, useEffect, useState } from 'react'
import { commonMsg, websiteAdmin } from 'src/i18n/locales/en'
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'

import { requestApi } from 'utils/axios/request'
import { FaEye, FaUser } from 'react-icons/fa'
import moment from 'moment'
import useSession from 'hooks/use-session'
import { Tenant } from 'types/tenant'
import { Form, FormSection } from 'components/form/Form'
import FormItem from 'components/form/Item'
import { cloneDeep } from 'lodash'
import { isEmpty } from 'utils/validate'
import { useParams } from 'react-router-dom'
import { getAdminLinks } from './links'
import { $config } from 'src/data/configs/config'
import { selectTenant } from 'utils/tenant'
import { AvailableStatus } from 'types/misc'

export const AdminTenants = memo(() => {
  const { session } = useSession()
  const toast = useToast()
  const config = useStore($config)
  const t = useStore(commonMsg)
  const t1 = useStore(websiteAdmin)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tempTenant, setTempTenant] = useState<Partial<Tenant>>(null)

  const adminLinks = getAdminLinks(config.currentTeam)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await requestApi.get('/tenant/list/all')
    setTenants(res.data)
  }

  const onAddTenant = () => {
    setTempTenant({ name: '' })
    onOpen()
  }

  const onCreateTenant = async () => {
    if (isEmpty(tempTenant.name)) {
      toast({
        title: t.isInvalid({ name: t.name }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    await requestApi.post('/tenant/create', tempTenant)
    toast({
      title: t.success,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    load()
    onClose()
  }

  const restoreTenant = async (tenant: Tenant) => {
    await requestApi.post(`/tenant/restore/${tenant.id}`)
    toast({
      title: t.isUpdated({ name: t.user }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    load()
  }

  return (
    <Page
      title={t1.websiteAdmin}
      subTitle={t.manageItem({ name: t.tenant })}
      icon={<FaUser />}
      tabs={adminLinks}
    >
      <Flex justifyContent='space-between'>
        <Box></Box>
        <Button size='sm' onClick={onAddTenant}>
          {t.newItem({ name: t.tenant })}
        </Button>
      </Flex>
      <TableContainer mt='2'>
        <Table variant='simple' size='sm' className='color-border-table'>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>{t.name}</Th>
              <Th>Owner</Th>
              <Th>{t.created}</Th>
              <Th>Status</Th>
              <Th>{t.action}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tenants.map((tenant) => {
              return (
                <Tr key={tenant.id}>
                  <Td>{tenant.id}</Td>
                  <Td>
                    <HStack>
                      <span>{tenant.name}</span>{' '}
                      {config.currentTenant == tenant.id && (
                        <Tag size={'sm'}>Current</Tag>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <HStack>
                      <span>{tenant.owner}</span>{' '}
                      {session?.user?.id == tenant.ownerId && (
                        <Tag size={'sm'}>You</Tag>
                      )}
                    </HStack>
                  </Td>
                  <Td>{moment(tenant.created).fromNow()}</Td>
                  <Th>
                    <Text
                      className={
                        tenant.status === AvailableStatus.DELETE && 'error-text'
                      }
                    >
                      {tenant.status === AvailableStatus.OK ? 'OK' : 'Deleted'}
                    </Text>
                  </Th>
                  <Td>
                    {/* <Button
                      size='sm'
                      variant='ghost'
                      onClick={() =>
                        selectTenant(
                          tenant.id,
                          config.currentTeam.toString(),
                          config,
                          toast,
                          '/admin/tenant/users',
                        )
                      }
                    >
                      View
                    </Button> */}
                    {tenant.status === AvailableStatus.DELETE && (
                      <Button
                        size='xs'
                        variant='outline'
                        ml='2'
                        onClick={() => restoreTenant(tenant)}
                      >
                        Restore
                      </Button>
                    )}
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t.addItem({ name: t.tenant })}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Form pb='5'>
              <FormSection title={t.basicSetting}>
                <FormItem title={t.name}>
                  <Input
                    placeholder={t.inputTips({ name: t.name })}
                    value={tempTenant?.name}
                    onChange={(e) => {
                      tempTenant.name = e.currentTarget.value.trim()
                      setTempTenant(cloneDeep(tempTenant))
                    }}
                  />
                </FormItem>

                <Button width='fit-content' onClick={onCreateTenant}>
                  {t.submit}
                </Button>
              </FormSection>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Page>
  )
})

export default AdminTenants
