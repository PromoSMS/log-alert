# log-alert
Monitoring tool that sends email when changes in file match certain pattern.

## INSTALLATION

Execute: `npm install`

Create file `config.json` based on `config.json.sample`.

-------------------

### Configuration parameters:

* **pid** _(optional)_ - path of file that will store process id of application
* **queueTimeout** - number of seconds between email sending retries
* **files** - array of observed files. Each file is defined by object with following parameters:
  * **path** - path of the observed file
  * **email** - email addresses of alert recipients
  * **pattern** _(optional)_ - regular expression (without delimiters). If not given, alert is sent each time the file changes
  * **regExpFlags** _(optional)_ - regular expression flags
        Example of "pattern" and "regExpFlags" parameters, for following regular expression: /test[\s-]?exp(ression)?/i
        "pattern": "test[\s-]?exp(ression)?",
        "regExpFlags": "i"
  * **subject** _(optional)_ - subject of email message
* **mailer** - smpp client configuration:
  * **from** - email address and name of sender:
    * **email**
    * **name**
  * **smtp** - smpp connection
    * **port** - port
    * **host** - host address
    * **secure** - is connection encrypted
    * **auth** - authorisation data
      * **user** - user's name
      * **pass** - user's password

-------------------

Run:

`nodejs log-alert.js`

Run as service:

`nodejs service.js`
