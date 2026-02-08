import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    try {
        const supabase = createClient(
            SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Fetch tasks due today or overdue
        const today = new Date().toISOString().split('T')[0]

        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*, profiles(full_name, id)')
            .eq('status', 'pending')
            .lte('due_date', today)

        if (tasksError) throw tasksError

        if (!tasks || tasks.length === 0) {
            return new Response(JSON.stringify({ message: 'No tasks to notify' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 2. Group tasks by user_id
        const userTasks: Record<string, any[]> = {}
        tasks.forEach(task => {
            if (!userTasks[task.user_id]) userTasks[task.user_id] = []
            userTasks[task.user_id].push(task)
        })

        const results = []

        // 3. Send emails via Resend
        for (const userId in userTasks) {
            // Get user email from auth.users (requires service_role)
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId)

            if (userError || !user?.email) continue

            const tasksList = userTasks[userId]
            const tasksHtml = tasksList.map(t => `
        <li style="margin-bottom: 10px;">
          <strong>${t.title}</strong><br/>
          <span style="color: #666; font-size: 12px;">Due: ${t.due_date} | Priority: ${t.priority}</span>
        </li>
      `).join('')

            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'BeeYield Notifications <notifications@beeyield.com>',
                    to: [user.email],
                    subject: `🐝 BeeYield: You have ${tasksList.length} tasks due today!`,
                    html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #1B9157;">Daily Task Reminder</h2>
              <p>Hi ${tasksList[0].profiles?.full_name || 'Beekeeper'},</p>
              <p>Just a quick reminder that you have the following tasks scheduled for today:</p>
              <ul style="list-style: none; padding: 0;">
                ${tasksHtml}
              </ul>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <a href="https://beeyield.com/dashboard/tasks" style="background: #F4D03F; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a>
              </div>
            </div>
          `,
                }),
            })

            const resData = await res.json()
            results.push({ email: user.email, status: res.status, data: resData })
        }

        return new Response(JSON.stringify({ results }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
