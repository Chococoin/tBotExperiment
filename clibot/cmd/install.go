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
  token     bool
  db        bool
  mailing   bool
  ecommerce bool
}

// statusCmd represents the status command
var installCmd = &cobra.Command{
  Use:   "install",
  Short: "Install a new bot",
  Long: `
  Install will create at $HOME/mySupervarasdasdBot a custom new
  telegram bot.
  `,
  Run: func (cmd *cobra.Command, args []string) {
    clear()
    f.Println(`
           /$$ /$$ /$$                   /$$    
          | $$|__/| $$                  | $$    
 /$$$$$$$ | $$ /$$| $$$$$$$   /$$$$$$  /$$$$$$  
/ $$_____/| $$| $$| $$__  $$ /$$__  $$|_  $$_/   
| $$      | $$| $$| $$  \ $$| $$  \ $$  | $$    
| $$      | $$| $$| $$  | $$| $$  | $$  | $$ /$$
|  $$$$$$$| $$| $$| $$$$$$$/|  $$$$$$/  |  $$$$/
\_______/ |__/|__/|_______/  \______/    \____/  

======================================================
A command-line interface to control your telegram bot.
======================================================`)
    f.Println("\n\t🕵️ Checking system requirements:\n")
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
    answerAgainAndWell()
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
    clear()
    f.Println("Your old good bot will be deleted. Are you sure?")
    f.Print("-> ")
    text, _ = reader.ReadString('\n')
    if text == "Yes\n" {
      clear()
      f.Println("\nOld good bot deleted 😢. But today a new 🤖 will born 🥳")
      err := os.RemoveAll(arg)
      if err != nil {
        f.Print("Error: Something wrong deleting %s try to do it manually", arg)
        os.Exit(101)
      }
      createDir(arg)
    } else if text == "No\n" {
        noDeleteBot()
    } else {
      answerAgainAndWell()
      askDeleteOldDefaultDir(arg)
    }
  } else if text == "No\n" {
      noDeleteBot()
  } else {
    clear()
    answerAgainAndWell()
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

func initNpm(dir string) {
  var textOfBashScript string = "#!/bin/bash\nDIRECTORY=$1\ncd $DIRECTORY\nnpm init -y"

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

  _, err = exec.Command("sh", "installnpm.sh", dir).Output()
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
  askFullOptions(customBotInfo, dir)
}

func askFullOptions(arg customOptions, dir string) {
  f.Println("Do you want your bot to use all features? (Yes or No)")
  f.Print("-> ")
  reader := bufio.NewReader(os.Stdin)
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    arg.token = true
    arg.db = true
    arg.mailing = true
    createBot(arg, dir)
  } else if text == "No\n" {
    askToken(arg, dir)
  } else {
    answerAgainAndWell()
    askFullOptions(arg, dir)
  }
}

func askToken(arg customOptions, dir string) {
  f.Println("Do you want your bot to uses an ERC-20 Token?")
  f.Print("-> ")
  reader := bufio.NewReader(os.Stdin)
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    arg.token = true
    askDb(arg, dir)
  } else if text == "No\n" {
    arg.token = false
    askDb(arg, dir)
  } else {
    answerAgainAndWell()
    askToken(arg, dir)
  }
}

func askDb(arg customOptions, dir string) {
  f.Println("Do you want your bot to uses a database to remember users by name?")
  f.Print("-> ")
  reader := bufio.NewReader(os.Stdin)
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    arg.db = true
  } else if text == "No\n" {
    arg.db = false
  } else {
    answerAgainAndWell()
    askDb(arg, dir)
  }
  mailing(arg, dir)
}

func mailing(arg customOptions, dir string) {
  f.Println("Do you want your bot to send email to users?")
  f.Print("-> ")
  reader := bufio.NewReader(os.Stdin)
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    arg.mailing = true
  } else if text == "No\n" {
    arg.mailing = false
  } else {
    answerAgainAndWell()
    mailing(arg, dir)
  }
  ecommerce(arg, dir)
}

func ecommerce(arg customOptions, dir string) {
  f.Println("Do you want your bot to sell products to your users?")
  f.Print("-> ")
  reader := bufio.NewReader(os.Stdin)
  text, _ := reader.ReadString('\n')
  if text == "Yes\n" {
    arg.ecommerce = true
  } else if text == "No\n" {
    arg.ecommerce = false
  } else {
    answerAgainAndWell()
    ecommerce(arg, dir)
  }
  createBot(arg, dir)
}

func createNpmInstallCommand(arg customOptions, dir string) {
  var textOfBashScript = "#!/bin/bash\nDIRECTORY=$1\ncd $DIRECTORY\nnpm i telegraf "
  clear()
  if arg.token == true {
    f.Println("Looking for Truffle framework in system")
    cmd, err := exec.Command("truffle", "version").Output()
    if err != nil {
      f.Printf("Error with exec.Command %s: \n", err)
      os.Exit(112)
    } else {
      var output = strings.Split(strings.Trim(string(cmd[:]), "\n"), "\n")
      var zeroIndex = strings.Split(output[0], " ")
      var lowerZeroIdx = strings.ToLower(zeroIndex[0])
      if lowerZeroIdx == "truffle" {
        f.Println("\n\t✅ truffle Version:\n")
        for _, index := range output {
          f.Print("\t\t- " + index + "\n")
        }
        f.Print("\n")
      } else {
        f.Println("Installing Truffle Framework")
        _, err = exec.Command("npm", "i", "-g", "truffle").Output()
        if err != nil {
          f.Print("Unable to install Truffle globally.")
          os.Exit(100)
        } else {
          f.Println("\t✅ Truffle successfully installed.")
        }
      }
    }
    textOfBashScript = textOfBashScript + "web3 " + "@truffle/hdwallet-provider "
  }
  if arg.db == true {
    textOfBashScript = textOfBashScript + "mysql2 "
  }
  if arg.mailing == true {
    textOfBashScript = textOfBashScript + "@sendgrid/client "
  }
}

func installDependencies(arg customOptions, cLine string, dir string) {
  f.Println("Installing dependencies...\n")
  file, err := os.Create("installDep.sh")
  if err != nil {
    f.Println("Cannot create file", err)
    os.Exit(2)
  }

  _, err = file.WriteString(cLine)
  if err != nil {
    f.Println(err)
    file.Close()
    os.Exit(2)
  }

  _, err = exec.Command("sh", "installDep.sh", dir).Output()
  if err != nil {
    f.Println("Could not install npm dependencies", err)
    os.Exit(2)
  } else {
    err = os.Remove("installDep.sh")
    if err != nil {
    f.Println("Could not delete installDep.sh. Please delete it manually", err)
    os.Exit(2)
    }
  }
}

func createBot(arg customOptions, dir string) {
  clear()
  var createFileBot string = "#!/bin/bash\nDIRECTORY=$1\ncd $DIRECTORY\ncat <<EOF > superBot.js\n"

  var botContent string = "'use strict'\n\nconst Telegraf = require('telegraf')\nconst { Markup } = Telegraf\nconst fs = require('fs')\n"
  if arg.token {
    botContent = botContent + "const Web3 = require('web3')\nconst HDWalletProvider = require('@truffle/hdwallet-provider')\n"
  }
  if arg.db {
    botContent = botContent + "const mySql = require('mysql2')\n"
  }
  if arg.mailing {
    botContent = botContent + "const Mail = require('@sendgrid/mail')\n"
  }

  botContent = botContent + "\nconst telegramApiKey = fs.readFileSync('.telegramApiKey').toString().trim()\n"

  if arg.ecommerce {
    botContent = botContent + "const PAYMENT_TOKEN = fs.readFileSync('.stripeApiKey').toString().trim()\n"
  }
  if arg.token {
    botContent = botContent + "const mnemonic = fs.readFileSync('.secret').toString().trim()\nconst infuraApi = fs.readFileSync('.infuraApiKey').toString().trim()\n"
  }

  createFileBot = createFileBot + botContent + "EOF"

  file, err := os.Create("createFileBot.sh")
  if err != nil {
    f.Println("Cannot create file", err)
    os.Exit(2)
  } else {
    _, err = file.WriteString(createFileBot)
    if err != nil {
      f.Println(err)
      file.Close()
      os.Exit(2)
    } else {
      _, err = exec.Command("sh", "createFileBot.sh", dir).Output()
      if err == nil {
        f.Println("A new Superbot is born! 🤖🍼")
        os.Remove("createFileBot.sh")
      } else {
        f.Println("Could not create superBot.js", err)
        os.Exit(2)
      }
    }
  }
}

func noDeleteBot() {
  clear()
  f.Println("Wise decision! Never kill a bot, we are your friends.\nDo your backup and comeback.\nSee you soon!\n")
  f.Println("You've chosen to keep your old default directory.\nInstallation interrupted.")
  os.Exit(1)
}

func answerAgainAndWell() {
  clear()
  f.Println("\n\t🚸 (Answer must be 'Yes' or 'No')\n")
}

func errLogInstall(arg error) {
  if arg != nil {
    f.Printf("❌ Error: %s\n", arg)
  }
} 

func clear() {
  c := exec.Command("clear")
  c.Stdout = os.Stdout
  c.Run()
}
