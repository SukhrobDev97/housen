import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { T } from '../../libs/types/common';
import { lookupMember } from '../../libs/config';
import { ProjectService } from '../project/project.service';



@Injectable()
export class CommentService {
   constructor(
    @InjectModel("Comment") private readonly commentModel: Model<Comment>,
    private readonly memberService: MemberService,
    private readonly projectService: ProjectService,
    private readonly boardArticleService: BoardArticleService,
   ){}

   public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
    input.memberId = memberId;

    let result: Comment | null = null
    try {
       result = await this.commentModel.create(input);
    } catch (err) {
        console.log('Error_Service.createComment', err.message);
        throw new BadRequestException(Message.CREATE_FAILED);
    }

    switch (input.commentGroup) {
        case CommentGroup.PROJECT:
            await this.projectService.projectStatsEditor({
                _id: input.commentRefId,
                targetKey: 'projectComments',
                modifier: 1,
            });
            break;

        case CommentGroup.ARTICLE:
            await this.boardArticleService.boardArticleStatsEditor({
                _id: input.commentRefId,
                targetKey: 'articleComments',
                modifier: 1,
            });
            break;

        case CommentGroup.MEMBER:
            await this.memberService.memberStatsEditor({
                _id: input.commentRefId,
                targetKey: 'memberComments',
                modifier: 1,
            });
            break;
    }

    if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
    return result;
}

public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
    const { _id } = input;
    const result = await this.commentModel.findOneAndUpdate(
      {
        _id: _id,
        memberId: memberId,
        commentStatus: CommentStatus.ACTIVE,
      },
      input,
      {
        new: true,
      },
    );
  
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }

  public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
    const { commentRefId } = input.search;
    const match: T = { commentRefId, commentStatus: CommentStatus.ACTIVE };
    const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };
  
    const result: Comments[] = await this.commentModel.aggregate([
      { $match: match },
      { $sort: sort },
      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
            lookupMember,
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ]);
  
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }
  
  public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
    const result = await this.commentModel.findByIdAndDelete(input);
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }
  

}   
