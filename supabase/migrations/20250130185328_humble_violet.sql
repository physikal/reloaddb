-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a function to handle user creation with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER -- Required to bypass RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (
      id,
      email,
      role,
      created_at,
      two_factor_enabled,
      two_factor_secret,
      last_login,
      load_form_config,
      load_card_config
    )
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'role', 'user'),
      COALESCE(new.created_at, now()),
      false, -- two_factor_enabled default
      null,  -- two_factor_secret default
      null,  -- last_login default
      null,  -- load_form_config default
      null   -- load_card_config default
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      role = COALESCE(new.raw_user_meta_data->>'role', users.role),
      updated_at = now();
    
    RETURN new;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new; -- Still return new to allow auth user creation even if profile fails
  END;
END;
$$;

-- Create a trigger to automatically create a user record
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO service_role;