// Copyright 2023 xObserve.io Team

import React, { useEffect, useState } from 'react'
import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  useToast,
  Text,
  HStack,
  Box,
  Portal,
} from '@chakra-ui/react'
import useSession from 'hooks/use-session'
import storage from 'utils/localStorage'

import {
  FaRegSun,
  FaUserAlt,
  FaSignOutAlt,
  FaStar,
  FaSignInAlt,
  FaFont,
} from 'react-icons/fa'

import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { localeSetting, locale } from 'src/i18n/i18n'
import { useStore } from '@nanostores/react'
import { commonMsg, sidebarMsg } from 'src/i18n/locales/en'
import SelectUserTeam from 'components/user/SelectUserTeam'
import { ColorModeSwitcher } from 'src/components/ColorModeSwitcher'
import SelectUserTenant from './SelectUserTenant'
import { isEmpty } from 'utils/validate'
import { $config } from 'src/data/configs/config'
import { Team } from 'types/teams'
import { requestApi } from 'utils/axios/request'
import { Tenant } from 'types/tenant'

const UserMenu = ({ miniMode }) => {
  const t = useStore(commonMsg)
  const t1 = useStore(sidebarMsg)
  const { session, logout } = useSession()

  const teamId = useParams().teamId
  let teamPath = ''
  if (!isEmpty(teamId)) {
    teamPath = `/${teamId}`
  }

  const toast = useToast()
  const config = useStore($config)
  const navigate = useNavigate()
  const location = useLocation()
  const login = () => {
    storage.set('current-page', location.pathname)
    navigate('/login')
  }

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    if (config && session) {
      loadTeams()
      loadTenants()
    }
  }, [config, session])

  const loadTeams = async () => {
    const res = await requestApi.get(
      `/team/user/is/in?tenantId=${config?.currentTenant}`,
    )
    setTeams(res.data)
  }

  const loadTenants = async () => {
    const res = await requestApi.get(`/tenant/user/is/in`)
    setTenants(res.data)
  }
  const changeLang = () => {
    const newLang = locale.get() == 'en' ? 'zh' : 'en'
    localeSetting.set(newLang)

    toast({
      title:
        newLang == 'en' ? 'Language changed to English' : '语言已切换为中文',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })

    // window.location.reload()
  }

  const isActive = window.location.pathname.startsWith('/account/')

  return (
    <>
      <Menu placement='right'>
        {miniMode ? (
          <MenuButton
            as={IconButton}
            size='md'
            fontSize='1em'
            aria-label=''
            variant='ghost'
            color={
              isActive ? useColorModeValue('brand.500', 'brand.200') : 'current'
            }
            _focus={{ border: null }}
            className='hover-text'
            icon={<FaUserAlt />}
          ></MenuButton>
        ) : (
          <MenuButton className='hover-text'>
            <HStack>
              <FaUserAlt />
              <Text fontSize='1em'>{t1.accountSetting}</Text>
            </HStack>
          </MenuButton>
        )}
        <Portal>
          <MenuList zIndex={1000} fontSize='1em'>
            <Link to={session ? `${teamPath}/account/setting` : null}>
              <MenuItem
                py='2px'
                cursor='default'
                bg='transparent'
                _hover={{ bg: 'transparent' }}
                icon={<FaUserAlt fontSize='1em' />}
              >
                <Text>{session?.user.username ?? 'Guest'}</Text>
                {config && (
                  <HStack spacing={1}>
                    <Text textStyle='annotation'>{config?.tenantName} - </Text>
                    <Text textStyle='annotation'>{config?.tenantRole}</Text>
                  </HStack>
                )}
              </MenuItem>
            </Link>
            <MenuDivider />
            {session && (
              <>
                <Link to={`${teamPath}/tenant/users`}>
                  <MenuItem width='100%' icon={<FaStar fontSize='1em' />}>
                    {t1.tenantAdmin}
                  </MenuItem>
                </Link>
                <MenuDivider />
              </>
            )}

            <MenuItem width='100%'>
              <Box width='100%'>
                <ColorModeSwitcher miniMode={false} />
              </Box>
            </MenuItem>
            <MenuItem
              width='100%'
              onClick={() => changeLang()}
              icon={<FaFont fontSize='1em' />}
            >
              {t1.currentLang} - {locale.get() == 'en' ? 'English' : '简体中文'}
            </MenuItem>
            {session && (
              <>
                <MenuDivider />
                {
                  <MenuItem mt='2px' width='100%'>
                    {' '}
                    <SelectUserTenant miniMode={false} tenants={tenants} />
                  </MenuItem>
                }
                {
                  <MenuItem mt='2px' width='100%'>
                    {' '}
                    <SelectUserTeam miniMode={false} teams={teams} />
                  </MenuItem>
                }
                <MenuDivider />
                <Link to={`${teamPath}/account/setting`}>
                  <MenuItem width='100%' icon={<FaRegSun fontSize='1em' />}>
                    {t1.accountSetting}
                  </MenuItem>
                </Link>
                <MenuItem
                  width='100%'
                  onClick={() => logout()}
                  icon={<FaSignOutAlt fontSize='1em' />}
                >
                  {t.logout}
                </MenuItem>
              </>
            )}
          </MenuList>
        </Portal>
      </Menu>
      {!session &&
        (miniMode ? (
          <IconButton
            size='md'
            fontSize='1em'
            aria-label=''
            variant='outline'
            color={useColorModeValue('brand.500', 'brand.200')}
            _focus={{ border: null }}
            onClick={() => login()}
            icon={<FaSignInAlt />}
          />
        ) : (
          <HStack cursor='pointer' onClick={() => login()}>
            <FaSignInAlt fontSize='1.1em' />
            <Text fontSize='1em'>{t.login}</Text>
          </HStack>
        ))}
    </>
  )
}

export default UserMenu
