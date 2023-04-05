## Creating a secure connection

To create a self-signed cert, run the command openssl command: 

```  
openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem  
```

This will generate two files: 

- cert.pem
- key.pem 

The key contains 4096 bits that ensure that we're the only ones encrypting data for this server.
ownership of the key means we're allowed to encrypt data for the server identified by the cert.

The cert allows you to decrypt the data encrypted with this key (key.pem). That's what the browser would do: it decrypts the data sent from the server, encrypted with the private key, using the data contained in the certificate. This is why the browser requires access to this public certificate. 
    **NB**: This approach is known as PUBLIC CRYPTOGRAPHY. This is what SSL & TLS use to make sure your data is kept safe.

With these two files availables, we can now set the paths when we create that server.

````
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app.).listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
````

createServer() takes in two args: 

- options object: {key: '' , cert: ''} 
- request listener: express application 

The fs.readFileSync() reads files synchronously and ensures that those files are loaded before passing them as options to our createServer() function and starting our server.

If we start our server and refresh our page (http:localhost:3000/secret) we'll get no response from the server: 'The page isn't working. Local host didn't send any data'. 

**Explanation**: There is an http server at port 3000, but it's only serving traffic that's using https. So we need to add that to our URL: (https: localhost:3000/secret)

We may get a notication on our browser alerting us to some privacy problem message ("Your connection is not private"). It'll tell us that the cert authority for that self-signed cert (the issuer is not a trusted cert authority recognized by our browser). To proceed with this, we must confirm that we're only testing this http server using this self-signed cert and that we trust this particular server. 

## Helmet

[Helmet](https://helmetjs.github.io/) is an NPM Package that contains a collection of express middlewares to help secure our server by setting various http headers. Consider:

````
import helmet from "helmet";

// ...

app.use(helmet());
````

app.use(helmet()) is a wrapper around 14 smaller middlewares, so that calling it returns that group of middlewares together -- unless you choose to disable some of them. 





