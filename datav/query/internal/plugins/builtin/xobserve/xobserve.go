package xobserve

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/plugins/builtin/xobserve/api"
	pluginUtils "github.com/xObserve/xObserve/query/internal/plugins/utils"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/models"
)

/* Query plugin for xobserve observability*/

var datasourceName = "xobserve"

type xobservePlugin struct{}

var conns = make(map[int64]ch.Conn)
var connsLock = &sync.Mutex{}

func (p *xobservePlugin) Query(c *gin.Context, ds *models.Datasource) models.PluginResult {
	query := c.Query("query")
	conn, ok := conns[ds.Id]
	if !ok {
		var err error
		conn, err = pluginUtils.ConnectToClickhouse(ds.URL, ds.Data["database"], ds.Data["username"], ds.Data["password"])
		if err != nil {
			colorlog.RootLogger.Warn("connect to clickhouse error:", err, "ds_id", ds.Id, "url", ds.URL)
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)

		}
		connsLock.Lock()
		conns[ds.Id] = conn
		connsLock.Unlock()
	}
	route, ok := api.APIRoutes[query]
	if ok {
		paramStr := c.Query("params")
		params := make(map[string]interface{})
		fmt.Println(paramStr)
		err := json.Unmarshal([]byte(paramStr), &params)
		if err != nil {
			return models.GenPluginResult(models.PluginStatusError, fmt.Sprintf("decode params error: %s", err.Error()), nil)
		}

		start := time.Now()
		res := route(c, ds, conn, params)

		colorlog.RootLogger.Info("Excecute observability query api", "query", query, "time", time.Since(start).String())
		return models.PluginResult{
			Status: models.PluginStatusSuccess,
			Error:  "",
			Data:   res,
		}
	} else {
		return models.GenPluginResult(models.PluginStatusError, "api not found", nil)
	}
}

func (p *xobservePlugin) TestDatasource(c *gin.Context) models.PluginResult {
	return pluginUtils.TestClickhouseDatasource(c)
}

func init() {
	// register datasource
	models.RegisterPlugin(datasourceName, &xobservePlugin{})
}
