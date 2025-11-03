import { Resolver } from '@nestjs/graphql';
import { ProjectService } from './project.service';

@Resolver()
export class ProjectResolver {
    constructor(private readonly projectService: ProjectService) {}
}
