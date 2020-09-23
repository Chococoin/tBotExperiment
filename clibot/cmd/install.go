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
    createDefaultDir(dirDefault)
  }

  if len(cmd) != 0 {
    f.Printf("\n\tElements in dir:\n\t %s", string(cmd[:]))
    f.Println("\tYou need to start a process with the default directory empty.\n")
    askDeleteOldDefaultDir(dirDefault)
  }
  initNpm()
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
    f.Printf("\t✅ npm Version: %s\n", output)
    return "OK"
  }
}

func createDefaultDir(arg string) {
  reader := bufio.NewReader(os.Stdin)
  f.Printf("Clibot will install you customed bot in %s\n", arg)
  f.Println("Do you want to continue creating the bot default directory? (Yes or No)")
  f.Print("-> ")
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    f.Printf("Creating default dir at %s\n", arg)
    createDir(arg)
    initNpm()
  } else if text == "No\n" {
    f.Print("If you want make me create a 🤖, we need the default directory.\n")
    f.Print("Comeback when you change your mind. 🧑‍💻\n")
    os.Exit(1)
  } else {
    f.Println("\n\t🚸 (Answer must be 'Yes' or 'No')\n")
    createDefaultDir(arg)
  }
}

func askDeleteOldDefaultDir(arg string) {
  reader := bufio.NewReader(os.Stdin)
  f.Println("Do you want to reset the bot default directory? (Yes or No)")
  f.Print("-> ")
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    // TODO f.Println("Because we ♥️ every 🤖, your old bot will be moved to a new directory.")
    f.Println("Your old good bot will be deleted. Are you sure?")
    f.Print("-> ")
    text, _ = reader.ReadString('\n')
    if text == "Yes\n" {
      err := os.RemoveAll(arg)
      f.Println("Old good bot deleted 😢. But today a new 🤖 will born 🥳")
      if err != nil {
        f.Print("Error: Something wrong deleting %s try to do it manually", arg)
        os.Exit(101)
      }
    } else {
      f.Println("Wise decision! Never kill a bot, we are your friends.\nDo your backup and comeback.\nSee you soon!")
    }
  } else if text == "No\n" {
    f.Println("You've chosen to keep your old default directory. Installation interrupted.")
    os.Exit(1)
  } else {
    f.Println("\n\t🚸 (Answer must be 'Yes' or 'No')\n")
    askDeleteOldDefaultDir(arg)
  }
}

func createDir(path string) {
  // Creation bot directories in default position. 
  err := os.Mkdir(path, 0775)

  if err != nil {
    errLogInstall(err)
  } else {
    f.Printf("New 🤖 directory created at %s\n", path)
  }
}

func initNpm() {
  f.Println("Select the features do you want for your bot..")
  var customBotInfo []bool
  askToken(customBotInfo)
}

func askToken(arg []bool) {
  f.Println("Do you want your bot to uses an ERC-20 Token?")
  f.Print("-> ")
  reader := bufio.NewReader(os.Stdin)
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    arg = append(arg, true)
  } else if text == "NO\n" {
    arg = append(arg, false)
  } else {
    f.Println("\n\t🚸 (Answer must be 'Yes' or 'No')\n")
    askToken(arg)
  }
}

func errLogInstall(arg error) {
  if arg != nil {
    f.Printf("❌ Error: %s\n", arg)
  }
} 
