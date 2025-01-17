// Copyright 2023 xObserve.io Team

import { HStack, Input, VStack } from '@chakra-ui/react'
import { CodeEditorModal } from 'src/components/CodeEditor/CodeEditorModal'
import { Form } from 'src/components/form/Form'
import FormItem from 'src/components/form/Item'
import { cloneDeep, isEmpty, set } from 'lodash'
import { useEffect, useState } from 'react'
import { PanelQuery } from 'types/dashboard'
import { DatasourceEditorProps } from 'types/datasource'
import React from 'react'
import { useStore } from '@nanostores/react'
import { httpDsMsg } from 'src/i18n/locales/en'
import { PanelTypeAlert } from '../../panel/alert/types'

const HttpQueryEditor = ({
  panel,
  datasource,
  query,
  onChange,
}: DatasourceEditorProps) => {
  const t1 = useStore(httpDsMsg)
  const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
  useEffect(() => {
    if (isEmpty(tempQuery.data.transformResult)) {
      setTempQuery({
        ...tempQuery,
        data: {
          ...tempQuery.data,
          transformResult: initTransformResult,
        },
      })
      onChange(cloneDeep(tempQuery))
    }

    if (isEmpty(tempQuery.data.transformRequest)) {
      setTempQuery({
        ...tempQuery,
        data: {
          ...tempQuery.data,
          transformRequest: initTransformRequest,
        },
      })
      onChange(cloneDeep(tempQuery))
    }
  }, [])
  const size = panel?.type == PanelTypeAlert ? 'sm' : 'md'
  return (
    <>
      <Form spacing={1}>
        <FormItem
          title='URL'
          labelWidth={size == 'md' ? '200px' : '60px'}
          size={size}
        >
          <Input
            value={tempQuery.metrics}
            onChange={(e) => {
              setTempQuery({
                ...tempQuery,
                metrics: e.currentTarget.value.trim(),
              })
            }}
            onBlur={() => onChange(tempQuery)}
            placeholder={t1.remoteHttp}
            size={size}
          />
        </FormItem>

        <FormItem
          title={t1.reqTransform}
          size={size}
          labelWidth={size == 'md' ? '200px' : '150px'}
          desc={t1.reqTransformTips}
          alignItems='center'
        >
          <CodeEditorModal
            value={tempQuery.data.transformRequest}
            onChange={(v) => {
              tempQuery.data.transformRequest = v
              onChange(tempQuery)
            }}
          />
        </FormItem>

        <FormItem
          title={t1.respTransform}
          size={size}
          labelWidth={size == 'md' ? '200px' : '150px'}
          desc={t1.respTransformTips}
          alignItems='center'
        >
          <CodeEditorModal
            value={tempQuery.data.transformResult}
            onChange={(v) => {
              tempQuery.data.transformResult = v
              onChange(tempQuery)
            }}
          />
        </FormItem>
      </Form>
    </>
  )
}

export default HttpQueryEditor

const initTransformRequest = `function transformRequest(url,headers,startTime, endTime, panel, variables) {
    let newUrl = url + \`?&start=$\{startTime}&end=$\{endTime}\`
    return newUrl
}`

const initTransformResult = `function transformResult(httpResult, query, startTime, endTime) {

    // Please resutrn {error: string | null, data: any} format
    // When using http datasource, it's your responsibility to make the panel you are using work!
    // so you need to know which data format the panel is using, and return data in that format.
    // You can find panel data format in Panel Debug.
    // Find more info in https://xobserve.io/docs or play the online demo https://play.xobserve.io
    return {
        error: null, 
        data: httpResult
    }
}`
