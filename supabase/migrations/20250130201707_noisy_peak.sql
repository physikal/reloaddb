-- Create email template configuration table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL UNIQUE,
  subject text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read templates
CREATE POLICY "Allow authenticated users to read email templates"
  ON public.email_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update email templates
CREATE OR REPLACE FUNCTION update_email_template(
  p_type text,
  p_subject text,
  p_content text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO email_templates (type, subject, content)
  VALUES (p_type, p_subject, p_content)
  ON CONFLICT (type) 
  DO UPDATE SET 
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = now();
END;
$$;