import StudentModel from "../model/StudentModel.js";
import AdminModel from "../model/AdminModel.js";
import TutorModel from "../model/TutorModel.js";

export class UserFactory{
    static createUser(type, userInfo){
        
        const { name, email, passwordHash} = userInfo;
        const userData = {name,email, passwordHash};
        switch(type)
        {
            case 'admin':
                return new AdminModel(userData);
            case 'tutor':
                return new TutorModel(userData);
            case 'student':
                return new StudentModel(userData);
            default:
                console.log('wrong type');
                return null;
        }
    }

    static async findByEmail(email) {
    const admin = await AdminModel.findOne({ email });
    if (admin) return { ...admin.toObject(), role: 'admin', model: 'AdminModel' };

    const tutor = await TutorModel.findOne({ email });
    if (tutor) return { ...tutor.toObject(), role: 'tutor', model: 'TutorModel' };

    const student = await StudentModel.findOne({ email });
    if (student) return { ...student.toObject(), role: 'student', model: 'StudentModel' };

    return null;
  }
}