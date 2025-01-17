// Copyright 2023 xObserve.io Team

import React, { memo } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardWrapper from 'src/views/dashboard/Dashboard'
import NotFoundPage from '../NotFound'
import { $config } from 'src/data/configs/config'
import { Box } from '@chakra-ui/react'
import Loading from 'components/loading/Loading'
import { Dashboard } from 'types/dashboard'
import { requestApi } from 'utils/axios/request'
import { $teams } from 'src/views/team/store'
import { $datasources } from 'src/views/datasource/store'
import { initVariableSelected } from 'src/views/variables/SelectVariable'
import { $variables } from 'src/views/variables/store'

interface Props {
  dashboard?: Dashboard
  sideWidth: number
}

const DashboardPageWrapper = memo(({ sideWidth }: Props) => {
  const teamId0 = Number(useParams().teamId)
  const teamId = isNaN(teamId0) ? 0 : teamId0
  let path = location.pathname.replace(`/${teamId}`, '')
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<Dashboard>(null)
  const [error, setError] = useState<string>(null)

  useEffect(() => {
    loadConfig(path)
  }, [path])

  const loadConfig = async (path) => {
    const res = await requestApi.get(
      `/config/dashboard?teamId=${teamId}&path=${path}`,
    )
    if (res.data.reload) {
      window.location.href = res.data.path
      return
    }
    const cfg = res.data.cfg
    cfg.sidemenu = (cfg.sidemenu as any).data.filter((item) => !item.hidden)
    $config.set(cfg)
    $teams.set(res.data.teams)
    $datasources.set(res.data.datasources)
    initVariableSelected(res.data.variables)
    $variables.set(res.data.variables)
    setDashboard(res.data.dashboard)
    if (res.data.path != path) {
      navigate('/' + res.data.cfg.currentTeam + res.data.path)
    }
  }
  return (
    <>
      {dashboard && (
        <DashboardWrapper
          key={dashboard.id}
          sideWidth={sideWidth}
          rawDashboard={dashboard}
        />
      )}
      {error && <NotFoundPage message={error} />}
      {!dashboard && !error && (
        <Box position='fixed' top='50vh' left='50vw'>
          <Loading />
        </Box>
      )}
    </>
  )
})

export default DashboardPageWrapper
