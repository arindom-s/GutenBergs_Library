const schema = new Schema({
    name: String,
    binary: Buffer,
    living: Boolean,
    updated: {type: Date, min:18, max:65, required:true},
    mixed: Schema.types.Mixed,
    _Id: Schema.types.ObjectId,
    array:[],
    ofString: [String],
    nested:{stuff:{type:String, lowercase:true, trim:true}},
});