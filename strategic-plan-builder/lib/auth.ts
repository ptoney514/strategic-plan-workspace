// lib/auth.ts
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  district_id?: string;
  role?: 'admin' | 'viewer';
}

// Sign up a new user
export async function signUp(email: string, password: string, districtId?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        district_id: districtId
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  // Create user profile in sp_users table
  if (data.user) {
    const { error: profileError } = await supabase
      .from('sp_users')
      .insert([{
        id: data.user.id,
        email: data.user.email,
        district_id: districtId,
        role: 'viewer',
        created_at: new Date().toISOString()
      }]);

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }

  return { user: data.user };
}

// Sign in an existing user
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  return { user: data.user };
}

// Sign out the current user
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

// Get the current user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get user profile with district information
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('sp_users')
    .select(`
      *,
      districts (
        id,
        name,
        slug,
        primary_color
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

// Check if user has access to a specific district
export async function hasDistrictAccess(userId: string, districtId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('sp_users')
    .select('id')
    .eq('id', userId)
    .eq('district_id', districtId)
    .single();

  return !error && data !== null;
}

// Update user role
export async function updateUserRole(userId: string, role: 'admin' | 'viewer') {
  const { error } = await supabase
    .from('sp_users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return false;
  }

  return true;
}

// Get all users for a district (admin only)
export async function getDistrictUsers(districtId: string) {
  const { data, error } = await supabase
    .from('sp_users')
    .select('*')
    .eq('district_id', districtId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching district users:', error);
    return [];
  }

  return data || [];
}

// Invite user to district (creates an invitation record)
export async function inviteUserToDistrict(email: string, districtId: string, role: 'admin' | 'viewer' = 'viewer') {
  // For now, we'll just create the user with a temporary password
  // In production, you'd want to send an email with a reset link
  const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
  
  const result = await signUp(email, tempPassword, districtId);
  
  if (result.error) {
    return { error: result.error };
  }

  // In production, send email with password reset link
  console.log(`User invited: ${email}, Temp password: ${tempPassword}`);
  
  return { success: true, tempPassword };
}