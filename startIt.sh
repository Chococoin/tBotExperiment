#!/bin/bash

# Starts a local blockcahin and a ipfs deamon-server.
one(){
    pwd
    echo "Out of minty"
    cd minty
    pwd
    echo "In minty directory"
    npm start
    wait
    sleep 10
    echo "End of minty/one"
}

# Deployment of NFT contract in local blockchain.
two(){
    echo "Starts NFT deployment"
    yes | minty deploy && echo "Deployment of ChocoSpace."
    wait
    echo "NTF deployment Ended"
    echo "Starts Treasury Smart contracts deployment."
    cd .. && pwd && truffle migrate --network development
    echo "Treasury Smart contract deployment ended."
}

two &
one &
two
