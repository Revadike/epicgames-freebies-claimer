# Changelog

### V1.4.0

- Added two factor authentication (2fa) support while EpicGames changed policy (Closes #17, #19, #21)
- Added update checker (Closes #20)

### V1.3.0

- Changed method of obtaining free games list (Closes #13)
- Added better logger (Closes #14)

### V1.2.3

- Small bugfix

### V1.2.2

- Added looping feature a.k.a. run forever* (Closes #2)
- Added multi-account support*

*Please update your config accordingly

### V1.2.1

- Makes `rememberLastSession` optional in config or launch parameter (Closes #8)
- Added ESLint linter

### V1.2.0

- Now allows web login, if normal login fails, e.g. due to captcha (Closes #3)

*Please run `npm install` again, to install `epicgames-client-login-adapter`, required to utilize this new feature

### V1.1.2

- Enables `rememberLastSession` by default* (Closes #4)

*Please run `npm update` to update `epicgames-client`, required to utilize this new feature

### V1.1.1

- Ensured all search results for all namespaces are purchased

### V1.1.0

- Added support for email/password arguments
- Moved saved credentials to config.json
- Ensured all search results are returned
- Fixed program not exiting

### V1.0.0

- Initial release
