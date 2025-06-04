const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // bcrypt er ikke lenger nødvendig hvis passord fjernes

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username er påkrevd'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email er påkrevd'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Bruk en gyldig e-postadresse',
        ],
    },
    // password: { // Fjernet
    //     type: String,
    //     required: [true, 'Passord er påkrevd'],
    //     minlength: [6, 'Passordet må være minst 6 tegn'],
    // },
    // role: { // Fjernet
    //     type: String,
    //     enum: ['user', 'admin'],
    //     default: 'user',
    // },
}, { timestamps: true });

// Pre-save hook til å hashe passordet før lagring
// UserSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         return next();
//     }
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// Metode for å sammenligne passord
// UserSchema.methods.comparePassword = async function (candidatePassword) {
//     return bcrypt.compare(candidatePassword, this.password);
// };

const User = mongoose.model('User', UserSchema);

module.exports = User;