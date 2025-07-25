'use client'
import { Authenticator, Heading, Radio, RadioGroupField, useAuthenticator, View } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { usePathname, useRouter } from 'next/navigation';
import '@aws-amplify/ui-react/styles.css';
import { useEffect } from 'react';

Amplify.configure({
    Auth:{
        Cognito:{
            userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
            userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
        },
    },
});

const formFields = {
    signIn:{
      username:{
        placeholder: 'Enter your email',
        label: 'Email',
        isRequired: true,
      },
      password:{
        placeholder: 'Enter your password',
        label: 'Password',
        isRequired: true,
      }
    },
    signUp:{
      username:{
        order: 1,
        placeholder: 'Choose a username',
        label: 'Username',
        isRequired: true,
      },
      email:{
        order:2,
        placeholder: 'Enter your email address',
        label: 'Email',
        isRequired: true,
      },
      password:{
        order:3,
        placeholder: 'Create a password',
        label: 'Password',
        isRequired: true,
      },
      confirm_password:{
        order:4,
        placeholder: 'Confirm your password',
        label: 'Confirm Password',
        isRequired: true,
      }
    }
};

const components = {
  Header(){
    return(
      <View className='mt-4 mb-7'>
        <Heading level={3} className="!text-2xl !font-bold">
          VIBE
          <span className="text-secondary-500 font-light hover:!text-primary-300">
            CHECK
          </span>
        </Heading>
        <p className="text-muted-foreground mt-2">
          <span className="font-bold">Welcome! </span>Please sign in to continue
        </p>
      </View>
    )
  },
  SignIn:{
    Footer(){
      const {toSignUp} = useAuthenticator();
      const router = useRouter();
      return(
        <View className="text-center mt-4">
          <p className='text-muted-foreground'>
            Don&apos;t have an account?{" "}
     
          <button onClick={() => {
            toSignUp();
            router.push('/signup');
          }} className='text-primary hover:underline bg-transparent border-none p-0'>Sign up here</button>
          </p>
        </View>
      )
    }
  },
  SignUp:{
    FormFields(){
      const {validationErrors} = useAuthenticator();

      return (
        <>
        <Authenticator.SignUp.FormFields/>

        <RadioGroupField
          legend="Role"
          name="custom:role"
          errorMessage={validationErrors?.["custom:role"]}
          hasError={!!validationErrors?.["custom:role"]}
          isRequired={true}
        >

          <Radio value="user">User</Radio>
          <Radio value="owner">Owner</Radio>
        </RadioGroupField>
        </>
      )
    
    },
    Footer(){
      const {toSignIn} = useAuthenticator();
      const router = useRouter();
      return(
        <View className="text-center mt-4">
          <p className='text-muted-foreground'>
           Already have an account?{" "}
     
          <button onClick={() => {
            toSignIn();
            router.push('/signin');
          }} className='text-primary hover:underline bg-transparent border-none p-0'>Sign in here</button>
          </p>
        </View>
      )
    }
  
    
  }
}

const Auth = ({ children }: {children: React.ReactNode}) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const pathname = usePathname();
  const router = useRouter();
  //Regex checking for auth pages
  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboard = pathname.startsWith("/user") || pathname.startsWith("/owner");


  //If user is signed in redirect
  useEffect(() =>{
    if (user && isAuthPage){
      router.push("/")
    }
  }, [user,isAuthPage,router]);

  //Allows access to public pages without auth
  if (!isAuthPage && !isDashboard) {
    return <>{children}</>
  }
    // Show the Authenticator UI if not signed in
    return (
      <div className='h-full'>
        <Authenticator
          initialState={pathname.includes("signup") ? "signUp" : "signIn"} 
          components={components}
          formFields={formFields}
        
        >{() => <>{children}</>}</Authenticator>
      </div>
    );
  

 
};

export default Auth;