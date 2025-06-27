"use client"
import SettingsForm from '@/components/SettingsForm';
import { useGetAuthUserQuery, useUpdateOwnerSettingsMutation } from '@/state/api'
import React from 'react'

const OwnerSettings = () => {
    const {data: authUser, isLoading} = useGetAuthUserQuery();
    console.log(authUser);
    //mutation call with []
    const [updateOwner] = useUpdateOwnerSettingsMutation();
    if (isLoading) return <div>Loading...</div>;
    const initialData = {
        username: authUser?.username,
        email: authUser?.email,
        phoneNumber: authUser?.phoneNumber,
    }

    const handleSubmit = async(data: typeof initialData) => {
        await updateOwner({
            cognitoId: authUser?.cognitoInfo?.userId,
            ...data,
        })
    }
  return (
    <SettingsForm
        initialData={initialData}
        onSubmit={handleSubmit}
        userType="owner"
    >

    </SettingsForm>
  )
}   

export default OwnerSettings
