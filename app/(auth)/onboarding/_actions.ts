'use server'
import { updateTeam, getOrCreateUser } from '@/db/queries'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export const completeOnboarding = async (team: string, clerkID: string) => {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) {
    return { success: false, message: 'No Logged In User' }
  }
  const client = await clerkClient()
  try {
    await updateTeam({team, clerkID});
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    })
    
    // Revalidate the path to ensure metadata is refreshed
    revalidatePath('/arena')
    revalidatePath('/onboarding')
    
    return { success: true }
  } catch (err) {
    console.error('Onboarding error:', err)
    return { success: false, error: 'There was an error updating the user metadata.' }
  }
}

export const getPlayerData = async () => {
  try {
    const player = await getOrCreateUser();
    return {
      firstName: player.first_name,
      clerkId: player.clerk_id
    }
  } catch (error) {
    console.error('Error fetching player data:', error)
    return null
  }
}