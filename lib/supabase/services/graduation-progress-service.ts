import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { createClient } from '../server';

interface AreaProgress {
  areaType: Database['public']['Enums']['course_area_type'];
  requiredCredits: number;
  earnedCredits: number;
  requiredElectiveCourses: number | null;
  completedElectiveCourses: number;
  totalElectiveCourses: number | null;
  courses: Array<{
    year: number;
    courseName: string;
    credits: number;
    grade: string;
    semester: string;
  }> | null;
}

export class GraduationProgressService {
  constructor(private readonly supabase: SupabaseClient<Database> = createClient()) {}

  async getStudentAreaProgress(
    studentId: string,
    departmentId: number,
    admissionYear: number,
    majorId?: number
  ): Promise<AreaProgress[]> {
    // 2월 17일 전공 코드가 없는 학과도 있으므로 majorId가 없으면 departmentId를 사용
    const { data, error } = await this.supabase.rpc('get_student_area_progress', {
      p_student_id: studentId,
      p_department_id: majorId ?? departmentId,
      p_admission_year: admissionYear,
    });
    console.log('data', data);
    if (error) {
      console.error('Failed to get area progress:', error);
      throw new Error('영역별 이수현황 조회에 실패했습니다.');
    }

    return data.map(row => ({
      areaType: row.area_type as Database['public']['Enums']['course_area_type'],
      requiredCredits: row.required_credits,
      earnedCredits: row.earned_credits,
      requiredElectiveCourses: row.required_elective_courses,
      completedElectiveCourses: row.completed_elective_courses,
      totalElectiveCourses: row.total_elective_courses,
      courses: row.courses as Array<{
        year: number;
        courseName: string;
        credits: number;
        grade: string;
        semester: string;
      }> | null,
    }));
  }

  async updateGraduationProgress(): Promise<void> {
    const { error } = await this.supabase.rpc('update_graduation_progress');

    if (error) {
      console.error('Failed to update graduation progress:', error);
      throw new Error('졸업요건 진척도 업데이트에 실패했습니다.');
    }
  }
}
