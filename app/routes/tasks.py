from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models
from app.schemas import Task, TaskCreate, TaskUpdate
from app.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[Task])
async def get_tasks(
    project_id: str = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Task).filter(models.Task.user_id == current_user.id)

    if project_id:
        # Check if user has access to the project
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        if not project or (project.owner_id != current_user.id and current_user not in project.members):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access tasks in this project"
            )
        query = query.filter(models.Task.project_id == project_id)

    tasks = query.all()
    return tasks

@router.post("", response_model=Task)
async def create_task(
    task_data: TaskCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If project_id is provided, check access
    if task_data.project_id:
        project = db.query(models.Project).filter(models.Project.id == task_data.project_id).first()
        if not project or (project.owner_id != current_user.id and current_user not in project.members):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create tasks in this project"
            )

    db_task = models.Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        due_date=task_data.due_date,
        user_id=current_user.id,
        project_id=task_data.project_id
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task

@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user owns this task
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    return task

@router.put("/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user owns this task
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    # If changing project, check access
    if task_data.project_id and task_data.project_id != task.project_id:
        project = db.query(models.Project).filter(models.Project.id == task_data.project_id).first()
        if not project or (project.owner_id != current_user.id and current_user not in project.members):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to move task to this project"
            )

    # Update fields
    for field, value in task_data.dict(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user owns this task
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}