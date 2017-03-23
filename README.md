1. Run in the terminal
```
npm init
```

2. Run in the terminal
```
serverless create --template aws-nodejs
```

3. update the service name

4. Log in to the AWS console and show that there is nothing

5. Deploy de lambda and show that there is a lamdba

6. Show the code in the console

7. Update the message, deploy again, and show the code. Test the Lambda

8. Add a http trigger
```
events:
  - http:
      path: hello
      method: get
```

9. Deploy, try the URL and check the AWS console

10. Check the logs for the Lambda
