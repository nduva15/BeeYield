-- Drop the restrictive policies and create permissive ones
DROP POLICY IF EXISTS "Anyone can manage conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can manage chat messages" ON public.chat_messages;

-- Create permissive policies for conversations
CREATE POLICY "Allow all access to conversations"
  ON public.conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create permissive policies for chat_messages
CREATE POLICY "Allow all access to chat messages"
  ON public.chat_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);