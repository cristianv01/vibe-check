"use client"
import SettingsForm from '@/components/SettingsForm';
import { useGetAuthUserQuery, useUpdateUserSettingsMutation } from '@/state/api'
import React from 'react'

const UserSettings = () => {
    const {data: authUser, isLoading} = useGetAuthUserQuery();
    console.log(authUser);
    //mutation call with []
    const [updateUser] = useUpdateUserSettingsMutation();
    if (isLoading) return <div>Loading...</div>;
    const initialData = {
        username: authUser?.username,
        email: authUser?.email,
        phoneNumber: authUser?.phoneNumber,
    }

    const handleSubmit = async(data: typeof initialData) => {
        await updateUser({
            cognitoId: authUser?.cognitoInfo?.userId,
            ...data,
        })
    }
  return (
    <SettingsForm
        initialData={initialData}
        onSubmit={handleSubmit}
        userType="user"
    >

    </SettingsForm>
  )
}

export default UserSettings
