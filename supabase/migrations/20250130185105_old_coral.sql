-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at)
  VALUES (new.id, new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE(new.created_at, now())
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a user record
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth users into the users table
INSERT INTO public.users (id, email, role, created_at)
SELECT 
  id,
  email,
  COALESCE((raw_user_meta_data->>'role')::text, 'user'),
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;