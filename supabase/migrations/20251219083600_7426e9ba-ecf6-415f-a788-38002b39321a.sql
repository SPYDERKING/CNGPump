-- Allow super admins to insert new pumps
CREATE POLICY "Super admins can insert pumps" 
ON public.pumps 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super admins to update any pump
CREATE POLICY "Super admins can update any pump" 
ON public.pumps 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super admins to delete pumps
CREATE POLICY "Super admins can delete pumps" 
ON public.pumps 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));