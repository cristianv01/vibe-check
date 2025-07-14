import React from 'react'
import { useForm } from 'react-hook-form'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'

const CreatePost = () => {
    const autoFill = new MapBoxAddressAutofill({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    })
  return (
    <Dialog>
        <form>
            <DialogTrigger asChild>
                <Button variant="outline">Create Post</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Post</DialogTitle>
                    <DialogDescription>Create a new post to share with your community</DialogDescription>
                    <hr></hr>
                </DialogHeader>
                {/*Grid for image upload and text input */}
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <Label>Image Upload</Label>
                        <Input type='file' accept='image/*' />
                    </div>
                    <div>
                        <div>
                            <Label>Title</Label>
                            <Input type='text' placeholder='Enter title' />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input></Input>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input type='text' placeholder='Enter description' />
                        </div>
                        <div>

                        </div>
                    </div>

                </div>

            </DialogContent>
        </form>
    </Dialog>
    // <div className="modal overlay">
    //     <div className="modal-content">
    //         <h1>Create Post</h1>
    //         <button>X</button>
    //         <Form></Form>
    //     </div>
      
    // </div>
  )
}

export default CreatePost
