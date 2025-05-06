import { faker } from '@faker-js/faker';


export function generateRegistrationData() {

    const roles = [
        { id: 'role-quiz-master', value: 'quiz_master', redirect: '/manage-topics' },
        { id: 'role-user', value: 'user', redirect: '/topics' }
    ];
    const selectedRole = faker.helpers.arrayElement(roles);
    const randomNumber = faker.string.numeric(3);
    const usernameBase = faker.internet.username().toLowerCase();
    const email = faker.internet.email().toLowerCase();
    const username = usernameBase + randomNumber;

    return {
        username: username,
        email: email,
        password: 'regietest',
        confirmPassword: 'regietest',
        role: selectedRole.value,
        roleId: selectedRole.id,
        expectedRedirect: selectedRole.redirect
    };

}