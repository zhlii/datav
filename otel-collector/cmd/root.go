// Copyright 2023 xObserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package cmd

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/spf13/cobra"
	flag "github.com/spf13/pflag"
	xobserveFeatureGate "github.com/xObserve/xObserve/otel-collector/featuregate"
	"github.com/xObserve/xObserve/otel-collector/internal/collector"
	"github.com/xObserve/xObserve/otel-collector/internal/service"
	"github.com/xObserve/xObserve/otel-collector/pkg/constants"
	otelcolFeatureGate "go.opentelemetry.io/collector/featuregate"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var cfgFile string

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "starship",
	Short: "",
	Long:  ``,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	Run: func(cmd *cobra.Command, args []string) {
		startCollector()
	},
}

func init() {
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file")
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func startCollector() {

	// Command line flags
	f := flag.NewFlagSet("Collector CLI Options", flag.ExitOnError)

	f.Usage = func() {
		fmt.Println(f.FlagUsages())
		os.Exit(0)
	}

	f.String("config", "", "File path for the collector configuration")
	f.String("manager-config", "", "File path for the agent manager configuration")
	f.Var(xobserveFeatureGate.NewFlag(otelcolFeatureGate.GlobalRegistry()), "feature-gates",
		"Comma-delimited list of feature gate identifiers. Prefix with '-' to disable the feature. '+' or no prefix will enable the feature.")
	err := f.Parse(os.Args[1:])
	if err != nil {
		log.Fatalf("Failed to parse args %v", err)
	}

	logger, err := initZapLog()
	if err != nil {
		log.Fatalf("failed to initialize zap logger: %v", err)
	}

	collectorConfig, _ := f.GetString("config")
	if collectorConfig == "" {
		collectorConfig = "./config/config.yaml"
	}

	managerConfig, _ := f.GetString("manager-config")
	copyPath, _ := f.GetString("copy-path")
	if managerConfig != "" {
		if err := copyConfigFile(collectorConfig, copyPath); err != nil {
			logger.Fatal("Failed to copy config file %v", zap.Error(err))
		}
		collectorConfig = copyPath
	}

	ctx := context.Background()

	coll := collector.New(
		collector.WrappedCollectorSettings{
			ConfigPaths:  []string{collectorConfig},
			Version:      constants.Version,
			Desc:         constants.Desc,
			LoggingOpts:  []zap.Option{zap.WithCaller(true)},
			PollInterval: 200 * time.Millisecond,
		},
	)

	svc, err := service.New(coll, logger, managerConfig, collectorConfig)
	if err != nil {
		logger.Fatal("failed to create collector service:", zap.Error(err))
	}

	ctx, cancel := signal.NotifyContext(ctx, syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	if err := runInteractive(ctx, logger, svc); err != nil {
		logger.Fatal("failed to run service:", zap.Error(err))
	}
}

func runInteractive(ctx context.Context, logger *zap.Logger, svc service.Service) error {
	if err := svc.Start(ctx); err != nil {
		return fmt.Errorf("failed to start collector service: %w", err)
	}

	// Wait for context done or service error
	select {
	case <-ctx.Done():
		logger.Info("Context done, shutting down...")
	case err := <-svc.Error():
		logger.Error("Service error, shutting down...", zap.Error(err))
	}

	stopTimeoutCtx, stopCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer stopCancel()

	if err := svc.Shutdown(stopTimeoutCtx); err != nil {
		return fmt.Errorf("failed to stop service: %w", err)
	}

	return nil
}

func initZapLog() (*zap.Logger, error) {
	config := zap.NewProductionConfig()
	config.EncoderConfig.EncodeLevel = zapcore.LowercaseLevelEncoder
	config.EncoderConfig.TimeKey = "timestamp"
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	logger, err := config.Build()
	return logger, err
}

func copyConfigFile(configPath string, copyPath string) error {
	// Check if file exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return fmt.Errorf("config file %s does not exist", configPath)
	}

	return copy(configPath, copyPath)
}

func copy(src, dest string) error {
	data, err := os.ReadFile(src)
	if err != nil {
		return fmt.Errorf("failed to read source file %s: %w", src, err)
	}

	err = os.WriteFile(dest, data, 0600)
	if err != nil {
		return fmt.Errorf("failed to write to dest file %s: %w", dest, err)
	}

	return nil
}
