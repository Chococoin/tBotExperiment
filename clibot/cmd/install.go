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

type customOptions struct {
  token   bool
  db      bool
  mailing bool
}

// statusCmd represents the status command
var installCmd = &cobra.Command{
  Use:   "install",
  Short: "Install a new bot",
  Long: `
  Install will create at $HOME/myBot a custom new
  telegram bot.
  `,
  Run: func (cmd *cobra.Command, args []string) {
    f.Println("🕵️ Checking system requirements:\n")
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

  var dirDefault = "/" + output[1] + "/" + strings.TrimSuffix(output[2], "\n") + "/mySuperBot"

  cmd, err := exec.Command("ls", dirDefault).Output()
  if err != nil {
    createDefaultDir(dirDefault)
  }

  directoryContent := strings.Split(strings.Trim(string(cmd[:]), "\n"), "\n")

  if len(cmd) != 0 {
    f.Printf("\n\tA 'mySuperBot' folder was detected in user's system.")
    f.Println("\n\tElements in default directory:\n")
    for _, index := range directoryContent {
      f.Print("\t- " + index + "\n")
    }
    f.Println("\n\tYou need to start a process with the default directory empty.\n")
    askDeleteOldDefaultDir(dirDefault)
  }
  initNpm(dirDefault)
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
  f.Println("Do you want to continue building within bot's default directory? (Yes or No)")
  f.Print("-> ")
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    f.Printf("Creating default dir at %s\n", arg)
    createDir(arg)
    initNpm(arg)
  } else if text == "No\n" {
    f.Print("If you want make me create a 🤖, we need to use the default directory.\n")
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
      os.Exit(102)
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
    f.Printf("New 🤖 directory created at %s\n\n", path)
  }
}

func initNpm(arg string) {
  var textOfBashScript = "#!/bin/bash\nDIRECTORY=$1\ncd $DIRECTORY\npwd\nnpm init -y"

  file, err := os.Create("installnpm.sh")
  if err != nil {
    f.Println("Cannot create file", err)
    os.Exit(2)
  }
  _, err = file.WriteString(textOfBashScript)
  if err != nil {
    f.Println(err)
    file.Close()
    os.Exit(2)
  }

  err = file.Close()
  if err != nil {
    f.Println(err)
    os.Exit(2)
  }

  _, err = exec.Command("sh", "installnpm.sh", arg).Output()
  if err != nil {
    f.Println("Could not initalize npm", err)
    os.Exit(2)
  }

  err = os.Remove("installnpm.sh")
  if err != nil {
    f.Println("Could not delete installnpm.sh. Please delete it manually", err)
  }

  f.Println("Select the features do you want for your bot ...")
  var customBotInfo customOptions
  askFullOptions(customBotInfo)
}

func askFullOptions(arg customOptions) {
  f.Println("Do you want your bot to use all features? (Yes or No)")
  f.Print("-> ")
  reader := bufio.NewReader(os.Stdin)
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    arg.token = true
    arg.db = true
    arg.mailing = true
    createPackageJSON(arg)
  } else if text == "No\n" {
    askToken(arg)
  } else {
    f.Println("\n\t🚸 (Answer must be 'Yes' or 'No')\n")
    askFullOptions(arg)
  }
}

func askToken(arg customOptions) {
  f.Println("Do you want your bot to uses an ERC-20 Token?")
  f.Print("-> ")
  reader := bufio.NewReader(os.Stdin)
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    arg.token = true
    askDb()
  } else if text == "No\n" {
    arg.token = false
    askDb()
  } else {
    f.Println("\n\t🚸 (Answer must be 'Yes' or 'No')\n")
    askToken(arg)
  }
}

func askDb(){
  f.Println("TODO: Ask for a db")
}

func createPackageJSON(arg customOptions) {
  var textOfBashScript = "#!/bin/bash\nFEATURES=$1\ncd $FEATURES\nnpm i telegraf "
  if arg.token == true {
    textOfBashScript = textOfBashScript + "web3" + " "
  }
  if arg.db == true {
    textOfBashScript = textOfBashScript + "mysql2" + " "
  }
  if arg.mailing == true {
    textOfBashScript = textOfBashScript + "sendgrid" + " "
  }
  // TODO: Create package.JSON
  f.Printf("Creating package.json:\n with %s \n", textOfBashScript)
  os.Exit(105)
}

func errLogInstall(arg error) {
  if arg != nil {
    f.Printf("❌ Error: %s\n", arg)
  }
} 
