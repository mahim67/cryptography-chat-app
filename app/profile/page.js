'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ProfilePage = () => {
  const [image, setImage] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className='flex items-center justify-center h-screen w-full bg-blue-100/40'>
      <Card className="w-2/3 h-2/3">
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-cols-2 gap-4 justify-center items-center w-full h-full">
          <div className='flex flex-col items-center justify-center w-[40%]'>
            <div className='border-2 border-green-800 rounded-full w-50 h-50 flex items-center justify-center overflow-hidden'>
              {image ? (
                <img src={image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500">No Image</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-4"
            />
          </div>
          <div className='flex flex-col gap-4 w-[60%]'>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Name" />
            <Label htmlFor="bio">Bio</Label>
            <textarea className='border-1 rounded-md p-3' id="bio" placeholder="Bio" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ProfilePage