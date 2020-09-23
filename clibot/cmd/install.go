package cmd

import (
  "bufio"
  f "fmt"
  "strings"
  "runtime"
  "os/exec"
  "os"
  
  "github.com/spf13/cobra"
)

// statusCmd represents the status command
var installCmd = &cobra.Command{
  Use:   "install",
  Short: "Install a new bot",
  Long: `
  Install will create at $HOME/myBot a custom new
  telegram bot.
  `,
  Run: func (cmd *cobra.Command, args []string) {
    f.Println("🕵️‍♂️ Checking system requirements:\n")
    sysDiagnosticInstall()
  },
}

func sysDiagnosticInstall() {
  if runtime.GOOS == "window" {
    f.Println("Currently, clibot 🤖 can't be execute on a windows machine.")
  } else {
    checkSotfwareRequirement()
  }
}

func install(nodeCheck string, npmCheck string) {

  if nodeCheck != "OK" && npmCheck != "OK" {
    os.Exit(100)
  }

	out, err := exec.Command("pwd").Output()

  if err != nil {
    errLogInstall(err)
  }

  output := strings.Split(string(out[:]), "/")

  var dirDefault = "/" + output[1] + "/" + output[2] + "/mySuperBot"

  cmd, err := exec.Command("ls", dirDefault).Output()


  if err != nil {
    // TODO if default directory doesn't exist create then it.
    errLogInstall(err)
    os.Exit(102)
  }

  if len(cmd) != 0 {
    f.Printf("\n\tElements in dir:\n\t %s", string(cmd[:]))
    f.Println("\tYou need to start a process with the default directory empty.\n")
    deleteOldDefaultDir(dirDefault)
    os.Exit(103)
  }
  
	// Creation bot directories in default position. 
  err = os.Mkdir(dirDefault, 0755)

  if err != nil {
    errLogInstall(err)
  } else {
    f.Printf("New super bot created in %s directory\n", dirDefault)
  }
} 

func init() {
  rootCmd.AddCommand(installCmd)

  // Here you will define your flags and configuration settings.

  // Cobra supports Persistent Flags which will work for this command
  // and all subcommands, e.g.:
  // installCmd.PersistentFlags().String("foo", "", "A help for foo")

  // Cobra supports local flags which will only run when this command
  // is called directly, e.g.:
  // installCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

func checkSotfwareRequirement() {
  osCheck()
  nodeCheckRes := nodeCheck()
  osCheckRes := npmCheck()
  install(nodeCheckRes, osCheckRes)
}

func osCheck() {
  var sysOs = runtime.GOOS
	f.Printf("\t✅ User system: %s\n", sysOs)
}

func nodeCheck() string {
  out, err := exec.Command("node", "--version").Output()
  if err != nil {
    errLogInstall(err)
    f.Println("Please Check if node.js is installed before install clibot.")
    return "NOT OK"
  } else {
    var output = string(out[:])
    f.Printf("\t✅ Node Version: %s", output)
    return "OK"
  }
} 

func npmCheck() string {
  out, err := exec.Command("npm", "--version").Output()
  if err != nil {
    errLogInstall(err)
    f.Println("Please Check if npm is installed before install clibot.")
    return "NOT OK"
  } else {
    var output = string(out[:])
    f.Printf("\t✅ npm Version: %s", output)
    return "OK"
  }
}

func deleteOldDefaultDir(arg string) {
  reader := bufio.NewReader(os.Stdin)
  f.Println("Do you want to reset the bot default directory? (Yes or No)")
  f.Print("-> ")
  text, _ := reader.ReadString('\n')
  for text != "Yes\n" && text != "No\n" {
    f.Println("\n\t🚸 (Answer must be 'Yes' or 'No')\n")
    deleteOldDefaultDir(arg)
  }
  if text == "Yes\n" {
    err := os.RemoveAll(arg)
    if err != nil {
      f.Print("Error: Something wrong deleting %s try to do it manually", arg)
      os.Exit(101)
    }
    // TODO : continue with installation
  } else {
    f.Print("You've chosen to keep your old default directory. Installation interrupted.")
    os.Exit(1)
  }
}

func errLogInstall(arg error) {
  if arg != nil {
    f.Printf("❌ Error: %s\n", arg)
  }
} 
