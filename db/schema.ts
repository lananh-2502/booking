import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const groups = sqliteTable('groups',{id:integer('id').primaryKey({autoIncrement:true}),name:text('name').notNull(),memberCount:integer('member_count').notNull(),createdAt:text('created_at').notNull()});
export const responses = sqliteTable('responses',{id:integer('id').primaryKey({autoIncrement:true}),groupId:integer('group_id').notNull().references(()=>groups.id),personName:text('person_name').notNull(),slots:text('slots').notNull(),createdAt:text('created_at').notNull()});
