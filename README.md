# CWRC-NERVEWrapper
A wrapper for the NERVE client/server functionality, for use in CWRC-Writer

### Enabling HTTPS/WSS

Here are the commands Ed used to get SN certs working on glassfish.
You can change the ports glassfish uses in the file "glassfish/domains/domain1/config/domain.xml.

$NAME and $PASS should be replaced with the appropriate values.

**stop server**

**concatenate keyfiles**

>  cat sharcnet-wildcard-6.crt digicert-intermediate.crt > concat.crt

**create pkcs12 file**

> openssl pkcs12 -export -in concat.crt -inkey sharcnet-wildcard-6.key -name $NAME -password pass:$PASS -out cert.p12

**copy keyfile to config directory then cd to it**

> cp cert.p12 glassfish/domains/domain1/config

> cd glassfish/domains/domain1/config

**import key**

> keytool -importkeystore -deststorepass changeit -destkeypass changeit -destkeystore keystore.jks -srckeystore cert.p12 -srcstoretype PKCS12 -srcstorepass $PASS -alias $NAME

**start server**
