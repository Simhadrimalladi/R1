import mongoose from 'mongoose';

const subTopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true }
});

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  subTopics: [subTopicSchema]
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  topics: [topicSchema]
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);
