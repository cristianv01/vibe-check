'use client'
import { Authenticator, Heading, Placeholder, useAuthenticator, View } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { usePathname } from 'next/navigation';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure({
    Auth:{
        Cognito:{
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
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
  }
}

const Auth = ({ children }: {children: React.ReactNode}) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  

  if (!isAuthPage) {
    return <>{children}</>
  }
    // Show the Authenticator UI if not signed in
    return (
      <div className='h-full'>
        <Authenticator 
           components={components}
           formFields={formFields}
        
        >{() => <>{children}</>}</Authenticator>
      </div>
    );
  

 
};

export default Auth;