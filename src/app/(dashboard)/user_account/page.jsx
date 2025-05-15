import React from 'react'
import MyAccount from './MyAccount'
import ProfileDetails from './ProfileDetails'
import Bio from './Bio'

const Account = () => {
  return (
    <div>
      <div className=' w-6/7'>
      <MyAccount/>
      <div className='flex gap-3'>
        <div className='w-2/6 h-full mt-3'>
            <Bio/>
        </div>
        <div className='w-4/6 mt-3 h-full '>
            <ProfileDetails/>
        </div>
      </div>
      </div>

    </div>
  )
}

export default Account
