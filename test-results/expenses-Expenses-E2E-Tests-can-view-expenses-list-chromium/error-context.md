# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - link "Log in to your account" [ref=e7] [cursor=pointer]:
      - /url: /
      - img [ref=e9]
      - generic [ref=e11]: Log in to your account
    - generic [ref=e12]:
      - heading "Log in to your account" [level=1] [ref=e13]
      - paragraph [ref=e14]: Enter your email and password below to log in
  - generic [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]: Email address
        - textbox "Email address" [active] [ref=e19]:
          - /placeholder: email@example.com
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Password
          - link "Forgot password?" [ref=e23] [cursor=pointer]:
            - /url: /forgot-password
        - textbox "Password" [ref=e24]
      - generic [ref=e25]:
        - checkbox "Remember me" [ref=e26]
        - checkbox
        - generic [ref=e27]: Remember me
      - button "Log in" [ref=e28]
    - generic [ref=e29]:
      - text: Don't have an account?
      - link "Sign up" [ref=e30] [cursor=pointer]:
        - /url: /register
```