// Copyright 2023 xObserve.io Team

import React from 'react'
import {
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  HStack,
  ModalHeader,
  ModalOverlay,
  Text,
  RadioGroup,
  Stack,
  Radio,
  useToast,
  VStack,
  Box,
  Input,
  Flex,
  Tag,
  Accordion,
  StackDivider,
} from '@chakra-ui/react'
import { Form, FormSection } from 'src/components/form/Form'
import FormItem from 'src/components/form/Item'
import useSession from 'hooks/use-session'
import Page from 'layouts/page/Page'
import { cloneDeep } from 'lodash'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { FaCog } from 'react-icons/fa'
import { Role, SuperAdminId } from 'types/role'
import { User } from 'types/user'
import { requestApi } from 'utils/axios/request'
import isEmail from 'validator/lib/isEmail'
import { useStore } from '@nanostores/react'
import { websiteAdmin, commonMsg } from 'src/i18n/locales/en'
import { isEmpty } from 'utils/validate'
import { useNavigate, useParams } from 'react-router-dom'
import { getAdminLinks } from './links'
import { Tenant } from 'types/tenant'
import ColorTag from 'components/ColorTag'
import { $config } from 'src/data/configs/config'
import { AvailableStatus } from 'types/misc'

const AdminUsers = () => {
  const t = useStore(commonMsg)
  const t1 = useStore(websiteAdmin)
  const { session } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>(null)
  useEffect(() => {
    load()
  }, [])

  const config = useStore($config)
  const adminLinks = getAdminLinks(config.currentTeam)

  const [userInEdit, setUserInEdit] = useState<User>()
  const [password, setPassword] = useState<string>('')
  const [userDetail, setUserDetail] = useState<{
    user: User
    tenants: Tenant[]
  }>(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure()
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure()
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure()

  const cancelRef = useRef()

  const load = async () => {
    const res = await requestApi.get('/admin/users')
    setUsers(res.data)
  }

  const editUser = (m: User) => {
    setUserInEdit(cloneDeep(m))
    onOpen()
  }

  const onDeleteUser = () => {
    onAlertOpen()
  }

  const updateUser = async () => {
    if (!isEmpty(userInEdit.email) && !isEmail(userInEdit.email)) {
      toast({
        description: t.isInvalid({ name: t.email }),
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    // if (!userInEdit.name) {
    //     toast({
    //         description: t.isInvalid({name: t.name}),
    //         status: "warning",
    //         duration: 2000,
    //         isClosable: true,
    //     });
    //     return
    // }

    await requestApi.post(`/admin/user`, userInEdit)
    toast({
      title: t.isUpdated({ name: t.user }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    load()
  }

  const updatePassword = async () => {
    if (password.length < 5) {
      toast({
        description: t1.pwAlert,
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      return
    }
    await requestApi.post(`/admin/user/password`, {
      id: userInEdit.id,
      password,
    })
    toast({
      title: t.isUpdated({ name: t.user }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const deleteUser = async () => {
    await requestApi.delete(`/admin/user/${userInEdit.id}`)
    toast({
      title: t.isDeleted({ name: t.user }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    setUserInEdit(null)
    onAlertClose()
    onClose()

    load()
  }

  const addUser = async () => {
    // if (!userInEdit.email || !isEmail(userInEdit.email)) {
    //     toast({
    //         description:  t.isInvalid({name: t.email}),
    //         status: "warning",
    //         duration: 2000,
    //         isClosable: true,
    //     });
    //     return
    // }

    const res = await requestApi.post(`/admin/user/new`, userInEdit)
    toast({
      title: t.isAdded({ name: t.user }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    onAddClose()
    setUserInEdit(null)
    users.unshift(res.data)
    setUsers(cloneDeep(users))
  }

  const onAddUser = () => {
    setUserInEdit({ role: Role.Viewer } as any)
    onAddOpen()
  }

  const updateUserRole = async (v) => {
    await requestApi.post(`/admin/user/role`, { id: userInEdit.id, role: v })
    toast({
      title: t.isUpdated({ name: t1.userRole }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    userInEdit.role = v as Role
    setUserInEdit(cloneDeep(userInEdit))
    load()
  }

  const viewDetail = async (user: User) => {
    const res = await requestApi.get(`/user/detail?id=${user.id}`)
    setUserDetail({
      user: user,
      tenants: res.data,
    })
    onDetailOpen()
  }

  const restoreUser = async (user: User) => {
    await requestApi.post(`/admin/user/restore/${user.id}`)
    toast({
      title: t.isUpdated({ name: t.user }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    load()
  }

  return (
    <>
      <Page
        title={t1.websiteAdmin}
        subTitle={t.manageItem({ name: t.user })}
        icon={<FaCog />}
        tabs={adminLinks}
        isLoading={users === null}
      >
        <Flex justifyContent='space-between'>
          <Box></Box>
          <Button size='sm' onClick={onAddUser}>
            {t.newItem({ name: t.user })}
          </Button>
        </Flex>

        <TableContainer mt='2'>
          <Table variant='simple' size='sm' className='color-border-table'>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>{t.userName}</Th>
                <Th>{t.nickname}</Th>
                <Th>{t.email}</Th>
                <Th>{t1.globalRole}</Th>
                <Th>{t.joined}</Th>
                <Th>Last seen at</Th>
                <Th>Visit count</Th>
                <Th>Status</Th>
                <Th>{t.action}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users?.map((user) => {
                return (
                  <Tr
                    key={user.id}
                    className={
                      (userDetail?.user.id == user.id ||
                        userInEdit?.id == user.id) &&
                      'highlight-bg'
                    }
                  >
                    <Td>{user.id}</Td>
                    <Td>
                      <HStack>
                        <span>{user.username}</span>{' '}
                        {session?.user?.id == user.id && (
                          <Tag size={'sm'}>You</Tag>
                        )}
                      </HStack>
                    </Td>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>{t[user.role]}</Td>
                    <Td>{moment(user.created).fromNow()}</Td>
                    <Td>
                      {user.lastSeenAt && moment(user.lastSeenAt).fromNow()}
                    </Td>
                    <Th>{user.visits ?? 0}</Th>
                    <Th>
                      <Text
                        className={
                          user.status === AvailableStatus.DELETE && 'error-text'
                        }
                      >
                        {user.status === AvailableStatus.OK ? 'OK' : 'Deleted'}
                      </Text>
                    </Th>
                    <Td>
                      <Button
                        variant='ghost'
                        size='sm'
                        px='0'
                        onClick={() => viewDetail(user)}
                      >
                        {t.detail}
                      </Button>
                      {user.status === AvailableStatus.DELETE ? (
                        <Button
                          size='xs'
                          variant='outline'
                          ml='2'
                          onClick={() => restoreUser(user)}
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          variant='ghost'
                          size='sm'
                          px='0'
                          ml='1'
                          onClick={() => editUser(user)}
                        >
                          {t.edit}
                        </Button>
                      )}{' '}
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Page>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setUserInEdit(null)
          onClose()
        }}
      >
        <ModalOverlay />
        {userInEdit && (
          <ModalContent>
            <ModalHeader>
              {t.editItem({ name: t.user })} - {userInEdit.username}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Form pb='5'>
                <FormSection title={t.basicSetting}>
                  <FormItem title={t.email}>
                    <Input
                      type='email'
                      placeholder={t.inputTips({ name: t.email })}
                      value={userInEdit.email}
                      onChange={(e) => {
                        userInEdit.email = e.currentTarget.value.trim()
                        setUserInEdit(cloneDeep(userInEdit))
                      }}
                    />
                  </FormItem>
                  <FormItem title={t.nickname}>
                    <Input
                      placeholder={t.inputTips({ name: t.nickname })}
                      value={userInEdit.name}
                      onChange={(e) => {
                        userInEdit.name = e.currentTarget.value
                        setUserInEdit(cloneDeep(userInEdit))
                      }}
                    />
                  </FormItem>

                  <Button width='fit-content' onClick={updateUser}>
                    {t.submit}
                  </Button>
                </FormSection>
                <FormSection title={t1.changePw}>
                  <FormItem title={t.password}>
                    <Input
                      placeholder={t.inputTips({ name: t.password })}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.currentTarget.value.trim())
                      }
                    />
                  </FormItem>
                  <Button width='fit-content' onClick={updatePassword}>
                    {t.submit}
                  </Button>
                </FormSection>

                <FormSection title={t1.globalRole}>
                  <RadioGroup
                    mt='1'
                    onChange={updateUserRole}
                    value={userInEdit.role}
                    isDisabled={userInEdit.id == SuperAdminId}
                  >
                    <Stack direction='row'>
                      <Radio value={Role.Viewer}>{t[Role.Viewer]}</Radio>
                      <Radio value={Role.ADMIN}>{t[Role.ADMIN]}</Radio>
                    </Stack>
                  </RadioGroup>
                </FormSection>

                <FormSection title={t.dangeSection}>
                  <Button
                    width='fit-content'
                    onClick={onDeleteUser}
                    colorScheme='red'
                  >
                    {t.deleteItem({ name: t.user })}
                  </Button>
                </FormSection>
              </Form>
            </ModalBody>
          </ModalContent>
        )}
      </Modal>
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setUserInEdit(null)
          onAddClose()
        }}
      >
        <ModalOverlay />
        {userInEdit && (
          <ModalContent>
            <ModalHeader>{t.newItem({ name: t.user })}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack alignItems='left' spacing='6' pb='5'>
                <Form
                  sx={{
                    '.form-item-label': {
                      width: '80px',
                    },
                  }}
                >
                  <FormItem title={t.userName}>
                    <Input
                      placeholder={t1.userNameInput}
                      value={userInEdit.username}
                      onChange={(e) => {
                        userInEdit.username = e.currentTarget.value.trim()
                        setUserInEdit(cloneDeep(userInEdit))
                      }}
                    />
                  </FormItem>
                  <FormItem title={t.email}>
                    <Input
                      type='email'
                      placeholder={t.inputTips({ name: t.email })}
                      value={userInEdit.email}
                      onChange={(e) => {
                        userInEdit.email = e.currentTarget.value.trim()
                        setUserInEdit(cloneDeep(userInEdit))
                      }}
                    />
                  </FormItem>

                  <FormItem title={t.password}>
                    <Input
                      placeholder={t.inputTips({ name: t.password })}
                      value={userInEdit.password}
                      onChange={(e) => {
                        userInEdit.password = e.currentTarget.value.trim()
                        setUserInEdit(cloneDeep(userInEdit))
                      }}
                    />
                  </FormItem>

                  <FormItem title={t1.globalRole}>
                    <RadioGroup
                      mt='3'
                      onChange={(v) => {
                        userInEdit.role = v as Role
                        setUserInEdit(cloneDeep(userInEdit))
                      }}
                      value={userInEdit.role}
                    >
                      <Stack direction='row'>
                        <Radio value={Role.Viewer}>{t[Role.Viewer]}</Radio>
                        <Radio value={Role.ADMIN}>{t[Role.ADMIN]}</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormItem>
                  <Button width='fit-content' onClick={addUser}>
                    {t.submit}
                  </Button>
                </Form>
              </VStack>
            </ModalBody>
          </ModalContent>
        )}
      </Modal>
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={onAlertClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {t.deleteItem({ name: t.user })} - {userInEdit?.username}
            </AlertDialogHeader>

            <AlertDialogBody>{t.deleteAlert}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                {t.cancel}
              </Button>
              <Button colorScheme='red' onClick={deleteUser} ml={3}>
                {t.delete}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setUserDetail(null)
          onDetailClose()
        }}
      >
        <ModalOverlay />
        {userDetail && (
          <ModalContent>
            <ModalCloseButton />
            <ModalBody py='4'>
              <Text fontWeight={550}>
                The tenants and teams that user `{userDetail.user.username}` is
                in:{' '}
              </Text>
              <Accordion
                mt='4'
                defaultIndex={userDetail.tenants.map((_, i) => i)}
                allowMultiple
              >
                <VStack alignItems='left' divider={<StackDivider />}>
                  {userDetail.tenants.map((tenant) => (
                    <>
                      <Flex justifyContent='space-between'>
                        <Text>{tenant.name}</Text>
                        <HStack>
                          {tenant.teams?.map((team) => (
                            <Box
                              cursor='pointer'
                              onClick={() =>
                                navigate(
                                  `/${config.currentTeam}/cfg/team/members`,
                                )
                              }
                            >
                              <ColorTag name={team.name} />
                            </Box>
                          ))}
                        </HStack>
                      </Flex>
                    </>
                  ))}
                </VStack>
              </Accordion>
            </ModalBody>
          </ModalContent>
        )}
      </Modal>
    </>
  )
}

export default AdminUsers
