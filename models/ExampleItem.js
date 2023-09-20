const mongoose = require('mongoose');



const ExampleItemSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    },
    dateLastUpdated: {
        type: Date,
        default: () => Date.now()
    },
    data: {
        type: String,
        default: 'Example data...'
    },
});

ExampleItemSchema.pre('save', function (next) {
    this.dateLastUpdated = Date.now();
    next();
});



ExampleItemSchema.methods.update = async function (args) {
    for (const key in args) {
        this[key] = args[key];
    }

    try {
        await this.save();
    } catch (err) {
        throw new Error('Error updating requested resource.');
    }

    return this;
}

ExampleItemSchema.methods.delete = async function (args) {
    try {
        await this.save();
    } catch (err) {
        throw new Error('Error updating requested resource.');
    }

    return this;
}



const ExampleItem = mongoose.model('ExampleItem', ExampleItemSchema);

module.exports = ExampleItem;
