export const AVAILABLE_LOCALES = ["en", "ar"];

export type Locale = {
  accessDenied: {
    title: string;
    description: string;
    helpText: string;
  };
  categories: {
    pageHeader: {
      titleAdmin: string;
      titleNonAdmin: string;
      description: string;
    };
    categoriesList: {
      title: string;
      description: string;
      empty: string;
      emptyHint: string;
    };
    subCategoriesTable: {
      title: string;
      description: string;
      searchPlaceholder: string;
      allCategories: string;
      noSubCategories: string;
      noMatches: string;
      underLabel: string;
    };
    addButton: {
      addCategory: string;
      addSubCategory: string;
    };
    categoryCard: {
      addKnowledgeChunk: string;
      noKnowledgeChunks: string;
      public: string;
      private: string;
    };
    categoryModal: {
      addTitle: string;
      editTitle: string;
      nameLabel: string;
      namePlaceholder: string;
      visibilityLabel: string;
      visibilityPublic: string;
      visibilityPrivate: string;
      initialKnowledgeLabel: string;
      initialKnowledgePlaceholder: string;
      cancel: string;
      saving: string;
      saveChanges: string;
      create: string;
    };
    subCategoryModal: {
      addTitle: string;
      editTitle: string;
      nameLabel: string;
      namePlaceholder: string;
      parentLabel: string;
      parentPlaceholder: string;
      cancel: string;
      saving: string;
      saveChanges: string;
      create: string;
    };
    knowledgeChunkModal: {
      addTitle: string;
      editTitle: string;
      contentLabel: string;
      contentPlaceholder: string;
      categoryLabel: string;
      categoryPlaceholder: string;
      cancel: string;
      saving: string;
      save: string;
    };
    actions: {
      edit: string;
      delete: string;
      share: string;
    };
    confirmations: {
      deleteCategoryTitle: string;
      deleteCategoryMessage: string;
      deleteSubCategoryTitle: string;
      deleteSubCategoryMessage: string;
      deleteKnowledgeChunkTitle: string;
      deleteKnowledgeChunkMessage: string;
    };
    toasts: {
      categoryCreated: string;
      categoryUpdated: string;
      categoryDeleted: string;
      cannotDeleteCategory: string;
      subCategoryCreated: string;
      subCategoryUpdated: string;
      subCategoryDeleted: string;
      cannotDeleteSubCategory: string;
      knowledgeChunkCreated: string;
      knowledgeChunkUpdated: string;
      knowledgeChunkDeleted: string;
      shareLinkCopied: string;
      shareError: string;
      deleteError: string;
      checkDeleteError: string;
    };
  };
  faqs: {
    pageHeader: {
      title: string;
      description: string;
    };
    filters: {
      title: string;
      description: string;
      clearAll: string;
      searchPlaceholder: string;
      departmentLabel: string;
      allDepartments: string;
      sortByLabel: string;
      sortByQuestion: string;
      sortByDepartment: string;
      sortByViews: string;
      sortBySatisfaction: string;
      sortByDissatisfaction: string;
      sortOrderLabel: string;
      ascending: string;
      descending: string;
    };
    table: {
      title: string;
      faqsAvailable: string;
      noFaqsFound: string;
      noFaqsHint: string;
      mainCategory: string;
      question: string;
      questions: string;
    };
    actions: {
      edit: string;
      delete: string;
    };
    addButton: {
      addNewFaq: string;
    };
    modal: {
      addTitle: string;
      editTitle: string;
      questionLabel: string;
      answerLabel: string;
      answerPlaceholder: string;
      mainCategoryLabel: string;
      subDepartmentLabel: string;
      allOfCategory: string;
      noSubDepartments: string;
      translateToLabel: string;
      cancel: string;
      saveChanges: string;
    };
    confirmations: {
      deleteTitle: string;
      deleteMessage: string;
      confirmText: string;
      cancelText: string;
    };
    toasts: {
      faqAdded: string;
      faqUpdated: string;
      faqDeleted: string;
      addError: string;
      updateError: string;
      uploadError: string;
      missingUploadKey: string;
    };
  };
  dashboard: {
    admin: {
      header: {
        title: string;
        description: string;
      };
      metrics: {
        totalUsers: string;
        activeTickets: string;
        completedTickets: string;
        pendingTasks: string;
        completedTasks: string;
        faqSatisfaction: string;
        expiredAttachments: string;
      };
      quickActions: {
        title: string;
        createDepartment: string;
        createSupervisor: string;
      };
      barChart: {
        title: string;
        tasks: string;
        tickets: string;
        avgResp: string;
      };
      analytics: {
        title: string;
        showMore: string;
        showLess: string;
      };
      recentActivity: {
        title: string;
        noActivity: string;
      };
      expiredAttachments: {
        title: string;
        noAttachments: string;
        manage: string;
        file: string;
        size: string;
        type: string;
        status: string;
        expires: string;
        created: string;
        expired: string;
        expiringSoon: string;
        active: string;
      };
      departmentFilter: {
        label: string;
        allDepartments: string;
        apply: string;
        applying: string;
      };
      toasts: {
        filterError: string;
      };
    };
    employee: {
      header: {
        title: string;
        description: string;
      };
      metrics: {
        completedTasks: string;
        closedTickets: string;
        expiredFiles: string;
      };
      pendingTasks: {
        title: string;
        noTasks: string;
        viewAll: string;
        due: string;
        today: string;
      };
      pendingTickets: {
        title: string;
        noTickets: string;
        viewAll: string;
        justNow: string;
        hoursAgo: string;
      };
      quickActions: {
        title: string;
        myTasks: string;
        myTickets: string;
        myFiles: string;
        addFaq: string;
      };
    };
  };
  tickets: {
    pageHeader: {
      title: string;
      ticketsAvailable: string;
    };
    dashboard: {
      title: string;
      totalTickets: string;
      pending: string;
      answered: string;
      closed: string;
    };
    filters: {
      title: string;
      searchPlaceholder: string;
      statusLabel: string;
      allStatus: string;
      new: string;
      seen: string;
      answered: string;
      closed: string;
      departmentLabel: string;
      allDepartments: string;
      updating: string;
    };
    list: {
      subject: string;
      status: string;
      department: string;
      date: string;
      priority: string;
      actions: string;
      noTickets: string;
      noTicketsHint: string;
      unknown: string;
      high: string;
      medium: string;
      low: string;
    };
    actions: {
      viewDetails: string;
      reply: string;
      viewEditReply: string;
      reopenForReply: string;
      close: string;
      delete: string;
    };
    export: {
      exportTickets: string;
      startDate: string;
      endDate: string;
      export: string;
      exporting: string;
      cancel: string;
    };
    modal: {
      title: string;
      customer: string;
      phone: string;
      subDepartment: string;
      subject: string;
      description: string;
      attachmentsTitle: string;
      reply: string;
      noReply: string;
      replyPlaceholder: string;
      promoteToFaq: string;
      promoteHint: string;
      close: string;
      cancel: string;
      sendReply: string;
    };
    confirmations: {
      deleteTitle: string;
      deleteMessage: string;
      confirmText: string;
      cancelText: string;
    };
    toasts: {
      ticketDeleted: string;
      ticketReplied: string;
      fetchError: string;
      exportError: string;
      replyError: string;
    };
    loading: {
      loadingTickets: string;
    };
  };
  manageTeam: {
    pageHeader: {
      title: string;
      description: string;
      activeEmployees: string;
    };
    filters: {
      searchPlaceholder: string;
      selectSubDepartment: string;
      selectPermission: string;
      search: string;
      clear: string;
    };
    table: {
      headers: {
        name: string;
        designation: string;
        subDepartments: string;
        permissions: string;
        actions: string;
      };
      loading: string;
      notSpecified: string;
      none: string;
      noEmployees: {
        title: string;
        hint: string;
      };
    };
    actions: {
      edit: string;
      delete: string;
    };
    inviteModal: {
      directTitle: string;
      requestTitle: string;
      emailLabel: string;
      fullNameLabel: string;
      jobTitleLabel: string;
      employeeIdLabel: string;
      subDepartmentsLabel: string;
      subDepartmentsTooltip: string;
      permissionsLabel: string;
      supervisorLabel: string;
      supervisorTooltip: string;
      supervisorPlaceholder: string;
      loadingDepartments: string;
      cancel: string;
      sendInvitation: string;
      submitRequest: string;
      processing: string;
      requiredFieldsError: string;
      supervisorRequiredError: string;
    };
    editModal: {
      title: string;
      for: string;
      subDepartmentsLabel: string;
      subDepartmentsTooltip: string;
      permissionsLabel: string;
      jobTitleLabel: string;
      jobTitlePlaceholder: string;
      employeeIdLabel: string;
      employeeIdPlaceholder: string;
      cancel: string;
      saveChanges: string;
      saving: string;
    };
    invitationButtons: {
      inviteDirectly: string;
      requestInvitation: string;
    };
    invitationRequests: {
      adminTitle: string;
      supervisorTitle: string;
      status: {
        pendingApproval: string;
        approved: string;
        rejected: string;
      };
      labels: {
        email: string;
        jobTitle: string;
        employeeId: string;
        supervisor: string;
        subDepartments: string;
      };
      actions: {
        accept: string;
        accepting: string;
        delete: string;
      };
    };
    confirmations: {
      deleteTitle: string;
      deleteMessage: string;
      confirmText: string;
    };
    toasts: {
      employeeDeleted: string;
      deleteFailed: string;
      cannotDelete: string;
      checkDeleteFailed: string;
      employeeUpdated: string;
      updateFailed: string;
      inviteSuccess: string;
      requestSuccess: string;
      inviteFailed: string;
      requestFailed: string;
      acceptSuccess: string;
      acceptFailed: string;
      deleteInvitationSuccess: string;
      deleteInvitationFailed: string;
    };
  };
  myFiles: {
    filehub: {
      pageHeader: {
        title: string;
        description: string;
      };
      uploadButton: string;
      tabs: {
        allFiles: string;
        documents: string;
        videos: string;
        images: string;
        audio: string;
      };
      search: {
        placeholder: string;
      };
      sections: {
        documents: string;
        videos: string;
        images: string;
        audio: string;
        items: string;
      };
      attachments: {
        title: string;
        count: string;
        loading: string;
        empty: {
          title: string;
          hint: string;
        };
        unknownType: string;
        expires: string;
        global: string;
        noExpiration: string;
        expirationDate: string;
        uploaded: string;
        queued: string;
        markedForDeletion: string;
        uploadedOn: string;
        label: string;
        description: string;
        dropFilesHere: string;
        orClickToBrowse: string;
        selectFiles: string;
        myFiles: string;
        filesSelected: string;
        totalSize: string;
        removeFile: string;
        preview: string;
        noFilesSelected: string;
        globalFlag: string;
        confirm: string;
        previewUnavailable: string;
        previewUnavailableMessage: string;
        file: string;
        close: string;
        myAttachments: string;
        noAttachmentsAvailable: string;
        addSelected: string;
        restoreFile: string;
        delete: string;
      };
      uploadModal: {
        title: string;
        dragDrop: string;
        fileSizeHint: string;
        preview: string;
        editMetadata: string;
        remove: string;
        cancel: string;
        uploadFile: string;
        uploading: string;
        selectFileError: string;
        endpointError: string;
      };
      metadataModal: {
        title: string;
        expirationLabel: string;
        globalLabel: string;
        globalHint: string;
        yes: string;
        no: string;
        cancel: string;
        done: string;
      };
      confirmations: {
        deleteTitle: string;
        deleteMessage: string;
        confirmText: string;
        cancelText: string;
      };
      toasts: {
        deleteSuccess: string;
        deleteFailed: string;
        uploadFailed: string;
      };
    };
    groups: {
      pageHeader: {
        title: string;
        description: string;
      };
      createButton: string;
      loading: string;
      loadError: string;
      grid: {
        title: string;
        count: string;
        empty: {
          title: string;
          hint: string;
        };
        groupId: string;
        files: string;
        watchers: string;
        expired: string;
        expires: string;
        createdOn: string;
        share: string;
        view: string;
        edit: string;
        delete: string;
      };
      modal: {
        createTitle: string;
        editTitle: string;
        viewTitle: string;
        createHint: string;
        nameLabel: string;
        namePlaceholder: string;
        nameHint: string;
        nameRequired: string;
        expirationLabel: string;
        expirationHint: string;
        selectedAttachments: string;
        availableAttachments: string;
        groupKey: string;
        createdAt: string;
        watchers: string;
        clients: string;
        expiresAt: string;
        noExpiration: string;
        currentAttachments: string;
        updateExpiration: string;
        updateExpirationHint: string;
        close: string;
        cancel: string;
        createGroup: string;
        saveChanges: string;
        saving: string;
      };
      shareModal: {
        title: string;
        shareLink: string;
        copy: string;
        copied: string;
        linkHint: string;
        close: string;
        openLink: string;
        generateError: string;
      };
      members: {
        title: string;
        description: string;
        addButton: string;
        loading: string;
        empty: {
          title: string;
          hint: string;
        };
        table: {
          name: string;
          attachmentGroup: string;
          created: string;
          actions: string;
        };
        status: {
          online: string;
          offline: string;
        };
        addModal: {
          title: string;
          otpLabel: string;
          otpPlaceholder: string;
          nameLabel: string;
          namePlaceholder: string;
          groupLabel: string;
          groupPlaceholder: string;
          cancel: string;
          add: string;
        };
        editModal: {
          title: string;
          nameLabel: string;
          namePlaceholder: string;
          groupLabel: string;
          groupPlaceholder: string;
          cancel: string;
          update: string;
        };
        confirmations: {
          deleteTitle: string;
          deleteMessage: string;
          confirmText: string;
          cancelText: string;
        };
        toasts: {
          loadFailed: string;
          addSuccess: string;
          addFailed: string;
          updateSuccess: string;
          updateFailed: string;
          deleteSuccess: string;
          deleteFailed: string;
          fillAllFields: string;
        };
      };
      confirmations: {
        deleteTitle: string;
        deleteMessage: string;
        confirmText: string;
        cancelText: string;
      };
      toasts: {
        createSuccess: string;
        updateSuccess: string;
        deleteSuccess: string;
        deleteFailed: string;
        createFailed: string;
        updateFailed: string;
      };
    };
  };
  profile: {
    pageHeader: {
      title: string;
      description: string;
    };
    editButton: string;
    profilePicture: {
      title: string;
      changePicture: string;
      uploading: string;
      uploadNewPicture: string;
    };
    profileInformation: {
      title: string;
      fields: {
        fullName: string;
        email: string;
        role: string;
        jobTitle: string;
        departments: string;
        permissions: string;
      };
      placeholders: {
        fullName: string;
        email: string;
      };
      saveChanges: string;
      saving: string;
      cancel: string;
    };
    passwordSecurity: {
      title: string;
      description: string;
      resetPassword: string;
      sendOtp: {
        title: string;
        sending: string;
        hint: string;
      };
      resetForm: {
        otpSent: string;
        otpCode: string;
        newPassword: string;
        confirmPassword: string;
        placeholders: {
          otpCode: string;
          newPassword: string;
          confirmPassword: string;
        };
        resetting: string;
        reset: string;
      };
    };
    toasts: {
      profileUpdated: string;
      updateFailed: string;
      pictureUpdated: string;
      pictureUpdateFailed: string;
      invalidFileType: string;
      otpSent: string;
      otpSendFailed: string;
      passwordReset: string;
      passwordResetFailed: string;
      invalidOtp: string;
      fillAllFields: string;
      passwordsDoNotMatch: string;
      passwordTooShort: string;
    };
    errors: {
      nameAndEmailRequired: string;
    };
  };
  promotions: {
    pageHeader: {
      title: string;
      description: string;
    };
    filters: {
      title: string;
      description: string;
      clearAll: string;
      searchPlaceholder: string;
      audience: {
        label: string;
        all: string;
        allValue: string;
        customer: string;
        supervisor: string;
        employee: string;
      };
      status: {
        label: string;
        all: string;
        active: string;
        inactive: string;
      };
      sortBy: {
        label: string;
        title: string;
        audience: string;
        startDate: string;
        endDate: string;
        createdAt: string;
      };
      sortOrder: {
        label: string;
        ascending: string;
        descending: string;
      };
    };
    table: {
      title: string;
      count: string;
      empty: {
        title: string;
        hint: string;
      };
      status: {
        active: string;
        inactive: string;
      };
      audience: {
        all: string;
        customer: string;
        supervisor: string;
        employee: string;
      };
      notSet: string;
      actions: {
        edit: string;
        activate: string;
        deactivate: string;
        delete: string;
      };
    };
    addButton: string;
    modal: {
      createTitle: string;
      editTitle: string;
      fields: {
        title: string;
        titlePlaceholder: string;
        audience: string;
        startDate: string;
        endDate: string;
      };
      audienceOptions: {
        all: string;
        customer: string;
        supervisor: string;
        employee: string;
      };
      buttons: {
        cancel: string;
        saveChanges: string;
        create: string;
      };
    };
    confirmations: {
      deleteTitle: string;
      deleteMessage: string;
      confirmText: string;
      cancelText: string;
    };
    toasts: {
      loadFailed: string;
      createSuccess: string;
      createFailed: string;
      updateSuccess: string;
      updateFailed: string;
      deleteSuccess: string;
      deleteFailed: string;
      activateSuccess: string;
      deactivateSuccess: string;
      statusUpdateFailed: string;
      uploadFailed: string;
      missingUploadKey: string;
      fillAllFields: string;
    };
  };
  supervisors: {
    pageHeader: {
      title: string;
      description: string;
    };
    inviteButton: string;
    stats: {
      activeSupervisors: string;
      pendingInvitations: string;
    };
    filters: {
      searchPlaceholder: string;
      departmentPlaceholder: string;
      clear: string;
    };
    table: {
      headers: {
        name: string;
        designation: string;
        department: string;
        email: string;
        actions: string;
      };
      notSpecified: string;
      none: string;
      empty: {
        title: string;
        hint: string;
      };
      actions: {
        edit: string;
        delegate: string;
        delete: string;
        forceDelete: string;
      };
    };
    invitations: {
      title: string;
      jobTitle: string;
      departments: string;
      expires: string;
      status: {
        pending: string;
        completed: string;
        rejected: string;
      };
      actions: {
        delete: string;
      };
    };
    editModal: {
      createTitle: string;
      editTitle: string;
      fields: {
        fullName: string;
        email: string;
        employeeId: string;
        employeeIdPlaceholder: string;
        jobTitle: string;
        jobTitlePlaceholder: string;
        assignDepartments: string;
        assignDepartmentsTooltip: string;
        choosePermissions: string;
      };
      permissions: {
        manageTvContent: string;
      };
      buttons: {
        cancel: string;
        saveChanges: string;
        sendInvitation: string;
      };
    };
    delegateModal: {
      title: string;
      searchPlaceholder: string;
      buttons: {
        cancel: string;
        delegate: string;
        delegating: string;
      };
    };
    imageCropModal: {
      title: string;
      instructions: {
        dragMove: string;
        squareCrop: string;
        tip: string;
      };
      cropArea: string;
      output: string;
      buttons: {
        cancel: string;
        cropImage: string;
      };
    };
    confirmations: {
      deleteTitle: string;
      deleteMessage: string;
      forceDeleteTitle: string;
      forceDeleteMessage: string;
      confirmText: string;
      cancelText: string;
    };
    toasts: {
      invitationDeleted: string;
      deleteInvitationFailed: string;
      updateSuccess: string;
      inviteSuccess: string;
      operationFailed: string;
      deleteSuccess: string;
      deleteFailed: string;
      cannotDelete: string;
      checkPermissionsFailed: string;
      delegateSuccess: string;
      delegateFailed: string;
      selectSupervisor: string;
      loadSupervisorsFailed: string;
      fillAllFields: string;
    };
  };
  tasks: {
    teamTasks: {
      pageHeader: {
        title: string;
        count: string;
      };
      dashboard: {
        title: string;
        totalTasks: string;
        completed: string;
        inProgress: string;
      };
      filters: {
        title: string;
        searchPlaceholder: string;
        status: {
          label: string;
          all: string;
          todo: string;
          seen: string;
          pendingReview: string;
          completed: string;
        };
        priority: {
          label: string;
          all: string;
          high: string;
          medium: string;
          low: string;
        };
        department: {
          label: string;
          all: string;
        };
      };
      export: {
        button: string;
        startDate: string;
        endDate: string;
        exporting: string;
        export: string;
        cancel: string;
      };
      empty: {
        title: string;
        hint: string;
      };
      loading: string;
      card: {
        actions: {
          edit: string;
          delete: string;
          approve: string;
          reject: string;
          viewDetails: string;
        };
        status: {
          pendingReview: string;
          seen: string;
          completed: string;
          rejected: string;
          todo: string;
        };
        submissionStatus: {
          submitted: string;
          approved: string;
          rejected: string;
        };
        priority: {
          high: string;
          medium: string;
          low: string;
        };
        submissions: string;
        viewSubmission: string;
        approve: string;
        reject: string;
        noSubmissions: string;
        dueDate: string;
        noDueDate: string;
        overdue: string;
        assignedTo: string;
        unassigned: string;
        lastUpdated: string;
        createdAt: string;
        notes: string;
        attachment: string;
        attachments: string;
        every: string;
      };
      confirmations: {
        deleteTitle: string;
        deleteMessage: string;
        confirmText: string;
        cancelText: string;
      };
      toasts: {
        fetchFailed: string;
        exportFailed: string;
        taskApproved: string;
        approveFailed: string;
        taskDeleted: string;
        deleteFailed: string;
        createSuccess: string;
        createFailed: string;
        updateSuccess: string;
        updateFailed: string;
        uploadFailed: string;
        missingUploadKey: string;
      };
    };
    myTasks: {
      pageHeader: {
        title: string;
        description: string;
        count: string;
      };
      dashboard: {
        title: string;
        totalTasks: string;
        completed: string;
        inProgress: string;
      };
      filters: {
        title: string;
        searchPlaceholder: string;
        status: {
          label: string;
          all: string;
          todo: string;
          seen: string;
          pendingReview: string;
          completed: string;
          inProgress: string;
          rejected: string;
        };
        priority: {
          label: string;
          all: string;
          high: string;
          medium: string;
          low: string;
        };
      };
      empty: {
        title: string;
        hint: string;
      };
      loading: string;
      clearFilters: string;
      actions: {
        markAsSeen: string;
        submitWork: string;
        viewDetails: string;
        delegate: string;
      };
      toasts: {
        fetchFailed: string;
        markSeenSuccess: string;
        markSeenFailed: string;
        submitSuccess: string;
        submitFailed: string;
        uploadFailed: string;
        missingUploadKey: string;
        addNotes: string;
      };
    };
    delegations: {
      pageHeader: {
        title: string;
        description: string;
        count: string;
      };
      dashboard: {
        title: string;
        totalDelegations: string;
        completed: string;
        inProgress: string;
      };
      filters: {
        title: string;
        searchPlaceholder: string;
        status: {
          label: string;
          all: string;
          todo: string;
          seen: string;
          pendingReview: string;
          completed: string;
          inProgress: string;
        };
        priority: {
          label: string;
          all: string;
          high: string;
          medium: string;
          low: string;
        };
      };
      empty: {
        title: string;
        hint: string;
      };
      loading: string;
      actions: {
        submitWork: string;
        viewDetails: string;
      };
      delegated: string;
      card: {
        individual: string;
        subDepartment: string;
        showSubmissions: string;
        hideSubmissions: string;
        submitted: string;
        feedback: string;
        forward: string;
      };
      toasts: {
        submitSuccess: string;
        submitFailed: string;
        uploadFailed: string;
        missingUploadKey: string;
        addNotes: string;
      };
    };
    modals: {
      addTask: {
        title: string;
        fields: {
          title: string;
          titlePlaceholder: string;
          description: string;
          descriptionPlaceholder: string;
          department: string;
          departmentPlaceholder: string;
          subDepartment: string;
          subDepartmentPlaceholder: string;
          assignee: string;
          assigneePlaceholder: string;
          priority: string;
          dueDate: string;
          reminder: string;
          days: string;
          hours: string;
          minutes: string;
          saveAsPreset: string;
        };
        priorityOptions: {
          low: string;
          medium: string;
          high: string;
        };
        buttons: {
          cancel: string;
          create: string;
        };
      };
      editTask: {
        title: string;
        buttons: {
          cancel: string;
          save: string;
          saving: string;
        };
      };
      submitWork: {
        title: string;
        fields: {
          notes: string;
          notesPlaceholder: string;
          description: string;
          noDescription: string;
        };
        buttons: {
          cancel: string;
          submit: string;
          submitting: string;
        };
      };
      submitDelegation: {
        title: string;
        fields: {
          notes: string;
          notesPlaceholder: string;
        };
        buttons: {
          cancel: string;
          submit: string;
          submitting: string;
        };
      };
      presets: {
        title: string;
        empty: string;
        createHint: string;
        searchPlaceholder: string;
        loading: string;
        noMatch: string;
        priority: string;
        buttons: {
          close: string;
          create: string;
          creating: string;
        };
      };
      createFromPreset: {
        title: string;
        buttons: {
          cancel: string;
          create: string;
          creating: string;
        };
      };
      approval: {
        title: string;
        message: string;
        buttons: {
          cancel: string;
          approve: string;
          approving: string;
        };
      };
      rejection: {
        title: string;
        fields: {
          reason: string;
          reasonPlaceholder: string;
        };
        buttons: {
          cancel: string;
          reject: string;
          rejecting: string;
        };
      };
      taskRejection: {
        title: string;
        fields: {
          reason: string;
          reasonPlaceholder: string;
        };
        buttons: {
          cancel: string;
          reject: string;
          rejecting: string;
        };
      };
      delegation: {
        title: string;
        fields: {
          supervisor: string;
          supervisorPlaceholder: string;
          notes: string;
          notesPlaceholder: string;
          employees: string;
          subDepartments: string;
        };
        buttons: {
          cancel: string;
          delegate: string;
          delegating: string;
        };
      };
    };
    toasts: {
      delegationSuccess: string;
      delegationFailed: string;
      approvalSuccess: string;
      approvalFailed: string;
      rejectionSuccess: string;
      rejectionFailed: string;
      taskRejectionSuccess: string;
      taskRejectionFailed: string;
    };
  };
  userActivity: {
    pageHeader: {
      title: string;
      description: string;
    };
    stats: {
      activeUsers: string;
      totalActivities: string;
    };
    filters: {
      title: string;
      searchPlaceholder: string;
      clearFilters: string;
      activityType: {
        label: string;
        all: string;
        ticketAnswered: string;
        taskPerformed: string;
        taskApproved: string;
        faqCreated: string;
        faqUpdated: string;
        promotionCreated: string;
        staffRequestCreated: string;
      };
      role: {
        label: string;
        all: string;
        admin: string;
        supervisor: string;
        employee: string;
      };
      dateRange: {
        label: string;
        all: string;
        today: string;
        week: string;
        month: string;
        quarter: string;
        year: string;
      };
    };
    performanceTable: {
      title: string;
      empty: string;
      columns: {
        user: string;
        role: string;
        answered: string;
        satisfied: string;
        dissatisfied: string;
        avgResponseTime: string;
        satisfactionRate: string;
      };
    };
    activityReport: {
      title: string;
      sections: {
        answeredTickets: string;
        tasksPerformed: string;
        tasksApproved: string;
        faqsCreated: string;
        faqsUpdated: string;
        promotionsCreated: string;
        staffRequestsCreated: string;
      };
      emptyMessages: {
        answeredTickets: string;
        tasksPerformed: string;
        tasksApproved: string;
        faqsCreated: string;
        faqsUpdated: string;
        promotionsCreated: string;
        staffRequestsCreated: string;
      };
      columns: {
        user: string;
        ticketId: string;
        subject: string;
        responseTime: string;
        rating: string;
        dateAnswered: string;
        taskTitle: string;
        completionTime: string;
        status: string;
        dateSubmitted: string;
        dateApproved: string;
        question: string;
        dateCreated: string;
        dateUpdated: string;
        title: string;
        audience: string;
        requestedUser: string;
        date: string;
        satisfied: string;
        dissatisfied: string;
        notAvailable: string;
      };
    };
  };
  login: {
    header: {
      title: string;
      description: string;
    };
    form: {
      title: string;
      fields: {
        username: {
          label: string;
          placeholder: string;
        };
        password: {
          label: string;
          placeholder: string;
          forgotPassword: string;
        };
      };
      buttons: {
        submit: string;
      };
    };
    errors: {
      invalidCredentials: string;
    };
  };
  passwordReset: {
    header: {
      title: string;
      description: {
        email: string;
        reset: string;
      };
    };
    form: {
      emailStep: {
        title: string;
        fields: {
          email: {
            label: string;
            placeholder: string;
          };
        };
        buttons: {
          send: string;
          sending: string;
        };
      };
      resetStep: {
        title: string;
        fields: {
          code: {
            label: string;
            placeholder: string;
          };
          newPassword: {
            label: string;
            placeholder: string;
          };
          confirmPassword: {
            label: string;
            placeholder: string;
          };
        };
        buttons: {
          reset: string;
          resetting: string;
          backToEmail: string;
        };
      };
    };
    success: {
      resetSuccess: string;
    };
    errors: {
      sendCodeFailed: string;
      resetFailed: string;
      passwordsDoNotMatch: string;
    };
    backToLogin: string;
  };
  components: {
    notifications: {
      messages: {
        staffRequestCreated: string;
        staffRequestResolved: string;
        taskCreated: string;
        taskApproved: string;
        taskRejected: string;
        taskSubmitted: string;
        taskDelegationCreated: string;
        ticketAssigned: string;
        ticketCreated: string;
        ticketReopened: string;
        default: string;
      };
      buttons: {
        dismiss: string;
        goToTasks: string;
        goToTickets: string;
        goToTeam: string;
        viewDetails: string;
      };
      totalItems: string;
    };
    logoutButton: {
      title: string;
      label: string;
    };
    permissionDenied: {
      title: string;
      description: string;
      helpText: string;
    };
    sidebar: {
      header: {
        title: string;
        subtitle: string;
      };
      tabs: {
        analytics: string;
        faqsAndCategories: string;
        faqs: string;
        categories: string;
        tickets: string;
        tasks: string;
        teamTasks: string;
        myTasks: string;
        manageTeam: string;
        promotions: string;
        supervisors: string;
        userActivity: string;
        myFiles: string;
        attachments: string;
        tvContent: string;
        myProfile: string;
        settings: string;
      };
    };
    toast: {
      close: string;
    };
    refreshButton: {
      label: string;
    };
    dateInput: {
      switchToHijri: string;
      switchToGregorian: string;
    };
  };
  settings: {
    pageHeader: {
      title: string;
      description: string;
    };
    language: {
      title: string;
      description: string;
      selectLabel: string;
      updating: string;
    };
  };
};
