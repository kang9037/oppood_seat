// Supabase 클라이언트 설정
import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = window.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 이벤트 관련 함수들
export const eventsAPI = {
    // 모든 이벤트 가져오기
    async getAllEvents() {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching events:', error)
            return []
        }
    },

    // 특정 타입의 이벤트 가져오기
    async getEventsByType(type) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('type', type)
                .order('date', { ascending: true })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching events by type:', error)
            return []
        }
    },

    // 특정 날짜의 이벤트 가져오기
    async getEventsByDate(date) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('date', date)
                .order('time', { ascending: true })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching events by date:', error)
            return []
        }
    },

    // 이벤트 ID로 가져오기
    async getEventById(id) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single()
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching event:', error)
            return null
        }
    },

    // 이벤트 참가자 수 업데이트
    async updateParticipants(eventId, increment = 1) {
        try {
            // 먼저 현재 이벤트 정보 가져오기
            const { data: event, error: fetchError } = await supabase
                .from('events')
                .select('current_participants, max_participants')
                .eq('id', eventId)
                .single()
            
            if (fetchError) throw fetchError
            
            // 최대 참가자 수 체크
            if (event.current_participants + increment > event.max_participants) {
                throw new Error('이벤트가 마감되었습니다.')
            }
            
            // 참가자 수 업데이트
            const { data, error } = await supabase
                .from('events')
                .update({ 
                    current_participants: event.current_participants + increment 
                })
                .eq('id', eventId)
                .select()
                .single()
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error updating participants:', error)
            throw error
        }
    }
}

// 신청 관련 함수들
export const applicationsAPI = {
    // 신청 생성
    async createApplication(applicationData) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .insert([applicationData])
                .select()
                .single()
            
            if (error) throw error
            
            // 참가자 수 증가
            await eventsAPI.updateParticipants(applicationData.event_id, 1)
            
            return data
        } catch (error) {
            console.error('Error creating application:', error)
            throw error
        }
    },

    // 이메일로 신청 조회
    async getApplicationsByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    events (*)
                `)
                .eq('email', email)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching applications:', error)
            return []
        }
    },

    // 신청 상태 업데이트
    async updateApplicationStatus(applicationId, status) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .update({ status })
                .eq('id', applicationId)
                .select()
                .single()
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error updating application:', error)
            throw error
        }
    },

    // 신청 취소
    async cancelApplication(applicationId) {
        try {
            // 먼저 신청 정보 가져오기
            const { data: application, error: fetchError } = await supabase
                .from('applications')
                .select('event_id')
                .eq('id', applicationId)
                .single()
            
            if (fetchError) throw fetchError
            
            // 신청 상태를 cancelled로 변경
            const { data, error } = await supabase
                .from('applications')
                .update({ status: 'cancelled' })
                .eq('id', applicationId)
                .select()
                .single()
            
            if (error) throw error
            
            // 참가자 수 감소
            await eventsAPI.updateParticipants(application.event_id, -1)
            
            return data
        } catch (error) {
            console.error('Error cancelling application:', error)
            throw error
        }
    }
}