-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'vendor', 'admin');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed');

-- Create enum for pricing types
CREATE TYPE public.pricing_type AS ENUM ('per_sq_ft', 'per_room');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  company_name TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'room' or 'paint'
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pricing table
CREATE TABLE public.pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  price_type pricing_type NOT NULL,
  price_value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create painting designs table
CREATE TABLE public.painting_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create painting requests table
CREATE TABLE public.painting_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  room_types JSONB NOT NULL,
  dimensions JSONB,
  dimension_image TEXT,
  estimated_cost DECIMAL(10,2),
  status request_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job updates table
CREATE TABLE public.job_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.painting_requests(id) ON DELETE CASCADE NOT NULL,
  status request_status NOT NULL,
  notes TEXT,
  before_image TEXT,
  after_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.painting_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.painting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_updates ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for pricing
CREATE POLICY "Pricing is viewable by everyone" ON public.pricing FOR SELECT USING (true);
CREATE POLICY "Only admins can manage pricing" ON public.pricing FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for painting designs
CREATE POLICY "Designs are viewable by everyone" ON public.painting_designs FOR SELECT USING (true);
CREATE POLICY "Vendors can manage own designs" ON public.painting_designs FOR ALL USING (auth.uid() = vendor_id);

-- RLS Policies for painting requests
CREATE POLICY "Users can view own requests" ON public.painting_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() = vendor_id OR get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users can create requests" ON public.painting_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and vendors can update requests" ON public.painting_requests FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = vendor_id OR get_user_role(auth.uid()) = 'admin');

-- RLS Policies for job updates
CREATE POLICY "Job updates viewable by related users" ON public.job_updates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.painting_requests pr 
    WHERE pr.id = request_id 
    AND (pr.user_id = auth.uid() OR pr.vendor_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
  )
);
CREATE POLICY "Vendors and admins can create job updates" ON public.job_updates FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.painting_requests pr 
    WHERE pr.id = request_id 
    AND (pr.vendor_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_painting_requests_updated_at
  BEFORE UPDATE ON public.painting_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (type, value) VALUES
  ('room', 'Bedroom'),
  ('room', 'Living Room'),
  ('room', 'Kitchen'),
  ('room', 'Bathroom'),
  ('room', 'Hall'),
  ('paint', 'Emulsion'),
  ('paint', 'Enamel'),
  ('paint', 'Texture');

-- Insert default pricing
INSERT INTO public.pricing (category_id, price_type, price_value)
SELECT c.id, 'per_sq_ft', 25.00
FROM public.categories c
WHERE c.type = 'room';

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('designs', 'designs', true),
  ('dimensions', 'dimensions', false),
  ('job-photos', 'job-photos', false);

-- Storage policies for designs bucket
CREATE POLICY "Design images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'designs');
CREATE POLICY "Vendors can upload designs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'designs' AND get_user_role(auth.uid()) = 'vendor');
CREATE POLICY "Vendors can update own designs" ON storage.objects FOR UPDATE USING (bucket_id = 'designs' AND get_user_role(auth.uid()) = 'vendor');

-- Storage policies for dimensions bucket
CREATE POLICY "Users can view own dimension images" ON storage.objects FOR SELECT USING (bucket_id = 'dimensions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload dimension images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dimensions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for job photos bucket
CREATE POLICY "Job photos viewable by related users" ON storage.objects FOR SELECT USING (bucket_id = 'job-photos');
CREATE POLICY "Vendors can upload job photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job-photos' AND get_user_role(auth.uid()) = 'vendor');
CREATE POLICY "Vendors can update job photos" ON storage.objects FOR UPDATE USING (bucket_id = 'job-photos' AND get_user_role(auth.uid()) = 'vendor');