# Inheritance v1

## Description

If a cryto holder dies, his assets are lost if the heirs don't have access to the private keys. To solve this problem, this contract functions as an watchdog: if the asset holder doesn't reset the watchdog counter, the heirs can withdraw the asset. 

Version 1 is a prove of concept:
* An address can indicate only one heir and a maximum time for the counter reset. 
* Only Ethers transactions are accepted (v2 will handle tokens only) 
* The asset holder may still withdral its own assets  