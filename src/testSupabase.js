import { supabase } from './lib/supabaseClient.js'

async function testConnection() {
  try {
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('Supabase 연결 테스트 시작...')
    
    const { data, error } = await supabase
      .from('_prisma_migrations')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('연결 오류:', error)
    } else {
      console.log('Supabase 연결 성공!')
      console.log('테이블 정보:', data)
    }
  } catch (err) {
    console.error('예외 발생:', err)
  }
}

testConnection()