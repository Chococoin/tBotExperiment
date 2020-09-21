package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// statusCmd represents the status command
var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show current status of bot",
	Long: `Bot will run as deamon with pm2.
		   This Command will start a process to run the
		   bot if it isn't working. This command is utile
		   when a user don't know the state of a bot and
		   wants to decide after if start it or not.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Status of feature 'TODO'.")
	},
}

func init() {
	rootCmd.AddCommand(statusCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// statusCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// statusCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
