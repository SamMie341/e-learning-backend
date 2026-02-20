import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor (private readonly prisma: PrismaService) {}

  async getProfile (userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        _count: { select: { enrollments: true } },
      },
    })
    if (!user) throw new NotFoundException('ບໍ່ພົບຜູ້ໃຊ້')
      console.log("External User Data:", user);
    const {...result } = user
    return {...result, department: user.department}
  }

  async updateProfile (
    userId: number,
    data: { fullname?: string; empimg?: string; departmentName?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullname: data.fullname,
        empImg: data.empimg,
        department: data.departmentName,
      },
    })
  }
}
