import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) { }

  async getStats() {
    const today = new Date();
    const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfLastMonth = new Date(firstDayOfThisMonth);
    endOfLastMonth.setMilliseconds(-1);

    const [
      totalUser,
      newUsersThisMonth,
      activeToday,
      totalCourses,
      publishedCourses,
      totalGraduates,

      courses,
      allEnrollments,
      currentCompletedCount,
      prevCompletedCount,

      recentActivities,
      recentGraduates
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: firstDayOfThisMonth } } }),
      this.prisma.user.count({ where: {lastActiveAt: {gte: today} } }),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { isPublished: true } }),
      this.prisma.enrollment.count({
        where: { completedAt: { not: null } }
      }),

      this.prisma.course.findMany({ select: { id: true, _count: { select: { lessons: true } } } }),
      this.prisma.enrollment.findMany({ select: { courseId: true, enrolledAt: true, course: { select: { title: true } } } }),

      this.prisma.lessonProgress.count({ where: { isCompleted: true } }),
      this.prisma.lessonProgress.count({
        where: {
          isCompleted: true,
          updatedAt: { lte: endOfLastMonth }
        }
      }),

      this.prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } }
      }),
      this.prisma.enrollment.findMany({
        where: { completedAt: { not: null } },
        take: 5,
        orderBy: { completedAt: 'desc' },
        include: {
          user: {
            select: { username: true }
          },
          course: { select: { title: true } }
        }
      })
    ]);

    const totalEnrollments = await this.prisma.enrollment.count();

    const courseLessonMap = new Map(courses.map(c => [c.id, c._count.lessons]));

    const calculateTotalPossible = (enrollmentList: any[]) => {
      let total = 0;
      for (const enrollment of enrollmentList) {
        total += courseLessonMap.get(enrollment.courseId) || 0;
      }
      return total;
    };

    const currentTotalPossible = calculateTotalPossible(allEnrollments);
    const completionRate = totalEnrollments === 0
      ? 0
      : Math.round((totalGraduates / totalEnrollments) * 100);

    const prevEnrollments = allEnrollments.filter(e => e.enrolledAt <= endOfLastMonth);
    const prevTotalPossible = calculateTotalPossible(prevEnrollments);
    const prevCompletionRate = prevTotalPossible === 0
      ? 0
      : Math.round((prevCompletedCount / prevTotalPossible) * 100);

    const completionRateGrowth = completionRate - prevCompletionRate;

    const activeTodayPercent = totalUser > 0 ? Math.round((activeToday / totalUser) * 100) : 0;

    const courseCounts: Record<number, { title: string; count: number }> = {};
    allEnrollments.forEach(e => {
      if (!courseCounts[e.courseId]) {
        courseCounts[e.courseId] = { title: e.course?.title || 'Unknown', count: 0 };
      }
      courseCounts[e.courseId].count++;
    });

    const popularCourses = Object.entries(courseCounts)
      .map(([id, data]) => ({
        id: Number(id),
        title: data.title,
        studentCount: data.count,
        percentage: Math.round((data.count / (allEnrollments.length || 1)) * 100)
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 5);

    // Return Data
    return {
      stats: {
        totalUser,
        newUsersThisMonth,
        activeToday,
        activeTodayPercent,
        totalCourses,
        activeCourses: publishedCourses,
        currentTotalPossible,
        completionRate,  
        completionRateGrowth, 
      },
      recentGraduates: recentGraduates.map(g => ({
        username: g.user.username,
        course: g.course.title,
        completedAt: g.completedAt
      })),
      recentActivities: recentActivities.map(log => ({
        id: log.id,
        username: log.user.username,
        action: log.action,
        targetName: log.targetName,
        timestamp: log.createdAt.toISOString(),
        type: log.type as any
      })),
      popularCourses
    };
  }
}